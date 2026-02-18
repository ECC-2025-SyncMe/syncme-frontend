import { useState, useEffect } from 'react';
import { FaBolt, FaWeightHanging, FaFire, FaSync } from 'react-icons/fa';
import '../styles/UpdatePage.css';
import '../styles/State.css';
import '../utils/dateUtils.js';
import { getCharacterMood } from '../utils/Characters/Character.js';

import stress from '../assets/characters/stress.png';
import burning from '../assets/characters/burning.png';
import happy from '../assets/characters/happy.png';
import neutral from '../assets/characters/neutral.png';

import * as updateApi from '../api/update.js';
import { settingUserData } from '../api/setting.js';
import { ChangeName } from '../api/setting.js';

export default function UpdatePage() {
  const [userData, setUserData] = useState(null);

  // 초기값을 0이 아닌 null로 설정하여 데이터 로딩 전
  const [statusData, setStatusData] = useState(null);

  const [character, setCharacter] = useState({
    summary: '',
    score: 0,
    mood: 'neutral'
  });
  const [loading, setLoading] = useState(true);

  const moodImg = { stress, burning, happy, neutral };

  // 프로필 편집
  const handleChangeName = async () => {
    const newNickname = prompt('새 닉네임을 입력하세요:');
    if (!newNickname) return;
    try {
      await ChangeName({ nickname: newNickname });
      alert('닉네임이 변경되었습니다.');
      setUserData((prev) => ({ ...prev, nickname: newNickname }));
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      alert('닉네임 변경에 실패했습니다.');
    }
  };

  // 초기 데이터 로드 (오늘 입력한 데이터가 있다면 불러오기)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 병렬 요청
        const [userRes, statusRes, charRes, summaryRes, scoreRes] =
          await Promise.allSettled([
            settingUserData(),
            updateApi.getTodayStatus(),
            updateApi.characterStatus(),
            updateApi.characterSummary(),
            updateApi.characterScore(),
          ]);

        // 유저 정보
        if (userRes.status === 'fulfilled') {
          const user = userRes.value.data?.data ?? userRes.value.data;
          setUserData(user);
        }

        // 오늘 기록된 상태 불러오기
        if (statusRes.status === 'fulfilled' && statusRes.value.data?.data) {
          // 서버에 저장된 데이터가 있으면 그것을 사용
          const serverData = statusRes.value.data.data;
          setStatusData({
            energy: serverData.energy || 0,
            burden: serverData.burden || 0,
            passion: serverData.passion || 0,
          });
        } else {
          // 서버에 데이터가 없으면(오늘 처음 접속), 0으로 초기화
          setStatusData({ energy: 0, burden: 0, passion: 0 });
        }

        // 캐릭터 정보
        const newChar = { mood: 'neutral', summary: '', score: 0 };
        if (charRes.status === 'fulfilled') newChar.mood = charRes.value.data?.mood || 'neutral';
        if (summaryRes.status === 'fulfilled') newChar.summary = summaryRes.value.data?.summary || '';
        if (scoreRes.status === 'fulfilled') newChar.score = scoreRes.value.data?.score || 0;

        setCharacter(newChar);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // 빈 배열 [] : 컴포넌트 마운트 시 1회 실행

  if (loading || !statusData) return <div style={{ color: 'white', padding: '50px' }}>데이터 불러오는 중...</div>;
  // 슬라이더 값 변경 핸들러
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setStatusData(prev => ({
      ...prev,
      [name]: parseInt(value, 10), // 숫자로 확실하게 변환
    }));
  };

  // 동기화 (저장) 핸들러
  const handleSync = async () => {
    try {
      setLoading(true);
      const requestData = {
        energy: statusData.energy,
        burden: statusData.burden,
        passion: statusData.passion
      };

      // 4-1. 데이터 저장 (Patch or Post)
      try {
        await updateApi.patchTodayStatus(requestData);
      } catch (patchErr) {
        if (patchErr.response?.data?.message === "기록이 없습니다." || patchErr.response?.status === 404) {
          await updateApi.postTodayStatus(requestData);
          console.log("기록이 없어 새로 저장합니다.");
        } else {
          throw patchErr;
        }
      }

      // 상태 계산 요청
      await updateApi.calculateStatus(requestData);

      // 갱신된 점수와 요약 다시 받아오기
      const [newScoreRes, newSummaryRes, newCharRes] = await Promise.all([
        updateApi.characterScore(),
        updateApi.characterSummary(),
        updateApi.characterStatus()
      ]);

      // 저장 후 받아온 최신 데이터로 화면 갱신
      setCharacter(prev => ({
        ...prev,
        score: newScoreRes.data.score,
        summary: newSummaryRes.data.summary,
        mood: newCharRes.data.mood || prev.mood // mood도 갱신될 수 있음
      }));

      alert('오늘의 상태 수정이 완료되었습니다!');
    } catch (error) {
      console.error("상세 에러:", error.response?.data);
      alert(`반영 실패: ${error.response?.data?.message || "서버 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-container">
      <span className="username" onClick={handleChangeName}>{userData?.nickname || 'JANE'}, </span>
      <span className="user-greeting">HOW ARE YOU?</span>

      <div className="content-space">
        <div className="character-image-container">
          {/* getCharacterMood 함수 대신 현재 상태 기반 렌더링 */}
          <img
            src={moodImg[getCharacterMood(statusData)] || moodImg['neutral']}
            alt="Character Mood"
            className="character-image"
          />
        </div>

        <div className="panel">
          <h3 className="section-title">
            {new Date().toLocaleDateString()}
            <br />
            오늘의 상태 <span>Status</span>

            {/* calculatedStatus 삭제하고 character.summary 사용 */}
            {character.summary && (
              <p className="char-summary" style={{ fontSize: '0.9rem', color: '#fff', marginTop: '10px', fontWeight: 'normal' }}>
                {character.summary}
              </p>
            )}
          </h3>

          <div className="stats-container">
            {/* ENERGY */}
            <div className="stat-item energy">
              <div className="label-row">
                <FaBolt className="icon" />
                <span className="name">ENERGY</span>
                <span className="value">{statusData.energy}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${statusData.energy}%` }}
                ></div>
                <input
                  type="range"
                  name="energy"
                  min="0"
                  max="100"
                  value={statusData.energy}
                  onChange={handleSliderChange}
                  className="real-slider"
                />
              </div>
            </div>

            {/* PRESSURE (BURDEN) */}
            <div className="stat-item pressure">
              <div className="label-row">
                <FaWeightHanging className="icon" />
                <span className="name">PRESSURE</span>
                <span className="value">{statusData.burden}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${statusData.burden}%` }}
                ></div>
                <input
                  type="range"
                  name="burden"
                  min="0"
                  max="100"
                  value={statusData.burden}
                  onChange={handleSliderChange}
                  className="real-slider"
                />
              </div>
            </div>

            {/* PASSION */}
            <div className="stat-item passion">
              <div className="label-row">
                <FaFire className="icon" />
                <span className="name">PASSION</span>
                <span className="value">{statusData.passion}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${statusData.passion}%` }}
                ></div>
                <input
                  type="range"
                  name="passion"
                  min="0"
                  max="100"
                  value={statusData.passion}
                  onChange={handleSliderChange}
                  className="real-slider"
                />
              </div>

              <button className="save-btn" onClick={handleSync} disabled={loading}>
                <FaSync className={loading ? "spin" : ""} /> {loading ? "Saving..." : "Sync"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}