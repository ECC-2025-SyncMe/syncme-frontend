// Character 상태 페이지
import { FaBolt, FaWeightHanging, FaFire } from 'react-icons/fa';
import '../styles/UpdatePage.css';
import '../styles/State.css';
import '../utils/dateUtils.js';
import { getCharacterMood } from '../utils/Characters/Character.js';

import stress from '../assets/characters/stress.png';
import burning from '../assets/characters/burning.png';
import happy from '../assets/characters/happy.png';
import neutral from '../assets/characters/neutral.png';

export default function UpdatePage() {
  // 임시 데이터
  const displayData = {
    stats: {
      energy: 30,
      burden: 20,
      passion: 90,
    },
  };

  // 캐릭터 이미지 매핑
  const moodImg = {
    stress,
    burning,
    happy,
    neutral,
  };

  return (
    <div className="update-container">
      <span className="username">JANE, </span>
      <span className="user-greeting">HOW ARE YOU?</span>

      <div className="content-space">
        <div className="character-image-container">
          <img
            src={moodImg[getCharacterMood(displayData.stats)]}
            alt="Character Mood"
            className="character-image"
          />
        </div>

        <div className="panel">
          <h3 className="section-title">
            Date: {new Date().toLocaleDateString()}
            <br />
            오늘의 상태 <span>Status</span>
          </h3>

          <div className="stats-container">
            <div className="stat-item energy">
              <div className="label-row">
                <FaBolt className="icon" />
                <span className="name">ENERGY</span>
                <span className="value">{displayData.stats.energy}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${displayData.stats.energy}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-item pressure">
              <div className="label-row">
                <FaWeightHanging className="icon" />
                <span className="name">PRESSURE</span>
                <span className="value">{displayData.stats.burden}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${displayData.stats.burden}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-item passion">
              <div className="label-row">
                <FaFire className="icon" />
                <span className="name">PASSION</span>
                <span className="value">{displayData.stats.passion}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${displayData.stats.passion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
