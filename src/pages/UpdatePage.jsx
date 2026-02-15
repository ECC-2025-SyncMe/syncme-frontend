// Character 상태 페이지
import { useState, useEffect } from 'react';
import { FaBolt, FaWeightHanging, FaFire } from 'react-icons/fa';
import '../styles/UpdatePage.css';
import '../styles/State.css';
import '../utils/dataUtiles.js';
import { getCharacterMood } from '../utils/Characters/Character.js';

import stress from '../assets/characters/stress.png';
import burning from '../assets/characters/burning.png';
import happy from '../assets/characters/happy.png';
import neutral from '../assets/characters/neutral.png';

import * as updateApi from '../api/update.js';
import { settingUserData } from '../api/setting.js';

export default function UpdatePage() {
  // 데이터를 담을 상태(state) 생성
  const [userData, setUserData] = useState(null);
  const [statusData, setStatusData] = useState({
    energy: 0,
    burden: 0,
    passion: 0,
  }); // getTodayStatus
  const [character, setCharacter] = useState({ summary: '', score: 0 }); // characterStatus, characterSummary
  const [loading, setLoading] = useState(true);

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

        setUserData(userRes.data);
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

  if (loading) return <div className="update-container">Loading...</div>;

  // 캐릭터 이미지 매핑
  const moodImg = { stress, burning, happy, neutral };

  // 2. 슬라이더 값 변경 핸들러
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({
      ...prev,
      [name]: parseInt(value), // 숫자로 변환하여 저장
    }));
  };

  return (
    <div className="update-container">
      <span className="username">{userData?.nickname || 'JANE'}, </span>
      <span className="user-greeting">HOW ARE YOU?</span>

      <div className="content-space">
        <div className="character-image-container">
          <img
            src={moodImg[getCharacterMood(statusData)]}
            alt="Character Mood"
            className="character-image"
          />
          {/* 캐릭터 점수 표시 (characterScore API 활용 예시) */}
          <div className="character-score-badge">Score: {character.score}</div>
        </div>

        <div className="panel">
          <h3 className="section-title">
            Date: {new Date().toLocaleDateString()}
            <br />
            오늘의 상태 <span>Status</span>
          </h3>
          {/* <p className="char-summary">"{character.summary}"</p> */}

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
                <span className="value">{statusData.pressure}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${statusData.pressure}%` }}
                ></div>
                <input
                  type="range"
                  name="pressure"
                  min="0"
                  max="100"
                  value={statusData.pressure}
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

              <button className="save-btn" onClick={updateApi.postTodayStatus}>
                오늘 상태 저장하기
              </button>

              {/* 미리보기나 계산 버튼이 필요할 때 활용
              <button
                className="preview-btn"
                onClick={async () => {
                  try {
                    const res = await updateApi.calculatePreview();
                    alert(`내 예상 상태: ${res.data.message}`);
                  } catch (error) {
                    console.error('미리보기 로드 실패:', error);
                    alert('미리보기에 실패하였습니다. 다시 시도해주세요!');
                  }
                }}
              >
                결괏값 기반 미리보기
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
