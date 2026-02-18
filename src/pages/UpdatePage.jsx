// Character 상태 페이지
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
  // 데이터를 담을 상태(state) 생성
  const [userData, setUserData] = useState(null);
  const [statusData, setStatusData] = useState({
    energy: 0,
    burden: 0,
    passion: 0,
  }); // getTodayStatus
  const [character, setCharacter] = useState({ summary: '', score: 0 }); // characterStatus, characterSummary
  const [calculatedStatus, setCalculatedStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 프로필 편집
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

  // API 호출 로직
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 2. 유저 정보와 오늘의 상태를 동시에 받아옵니다.
        const [userRes, statusRes, charRes, summaryRes, scoreRes] =
          await Promise.all([
            settingUserData(),
            updateApi.getTodayStatus(),
            updateApi.characterStatus(),
            updateApi.characterSummary(),
            updateApi.characterScore(),
          ]);

        const user = userRes.data?.data ?? userRes.data;
        setUserData(user);

        setStatusData(statusRes.data || { energy: 0, burden: 0, passion: 0 });
        // 캐릭터 상태와 요약 문장을 합쳐서 저장
        setCharacter({
          ...charRes.data,
          summary: summaryRes.data.summary,
          score: scoreRes.data.score,
        });
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const moodImg = { stress, burning, happy, neutral };
  <img src={moodImg[getCharacterMood(statusData)]} />

  // 2. 슬라이더 값 변경 핸들러
  const handleSliderChange = async (e) => {
    const { name, value } = e.target;
      setStatusData(prev => ({
      ...prev,
      [name]: parseInt(value), // 숫자로 변환
    }));
  };

  const handleSync = async () => {
    try {
      setLoading(true);

      const requestData = {
        energy: statusData.energy,
        burden: statusData.burden,
        passion: statusData.passion
      };

      // 1. 저장 또는 수정 (기존 로직 유지)
      try {
        await updateApi.patchTodayStatus(requestData);
      } catch (patchErr) {
        if (patchErr.response?.data?.message === "기록이 없습니다.") {
          await updateApi.postTodayStatus(requestData);
          console.log("기록이 없어 새로 저장합니다.");
        } else { throw patchErr; }
      }

      // 2. 중요: 계산 API 호출 시 데이터를 함께 전달
      await updateApi.calculateStatus(requestData);

      // 3. 최신 점수 가져오기
      const scoreRes = await updateApi.characterScore();
      setCharacter(prev => ({ ...prev, score: scoreRes.data.score }));
      
      alert('오늘의 상태 수정이 완료되었습니다!');
    } catch (error) {
      // 구체적인 에러 위치 파악을 위해 로그 강화
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
          <img
            src={moodImg[getCharacterMood(statusData)]}
            alt="Character Mood"
            className="character-image"
          />
          {/* 캐릭터 점수 표시 (characterScore API 활용 예시) 
          <div className="character-score-badge">Score: {character.score}</div>*/}
        </div>

        <div className="panel">
          <h3 className="section-title">
            {new Date().toLocaleDateString()}
            <br />
            오늘의 상태 <span>Status</span>
            {calculatedStatus && (
              <p className="char-summary">{calculatedStatus.summary}</p>
            )}

          </h3>

          <div className="stats-container">
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
                ></input>
              </div>
            </div>

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
                ></input>
              </div>
            </div>

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
                ></input>
              </div>

              <button className="save-btn" onClick={handleSync}>
                <FaSync className={loading ? "spin" : ""} /> Sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
