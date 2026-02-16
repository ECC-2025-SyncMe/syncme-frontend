import React from 'react';
import { getCharacterMood } from '../../utils/Characters/Character.js';
import { CenterPanel } from './CenterModelPanelStyles';

import stress from '../../assets/characters/stress.png';
import burning from '../../assets/characters/burning.png';
import happy from '../../assets/characters/happy.png';
import neutral from '../../assets/characters/neutral.png';

const moodImg = { stress, burning, happy, neutral };

export default function CenterModelPanel({ stats }) {
    const safeStats = stats || { energy: 0, burden: 0, passion: 0 };
    const mood = getCharacterMood(safeStats);

    return (
        <CenterPanel>
            <img
                src={moodImg[mood]}
                alt="Character Status"
                style={{
                    width: '100%',
                    maxWidth: '380px',
                    height: 'auto',
                    objectFit: 'contain',
                    // [수정 포인트] 이미지 모서리를 더 둥글게 (부모 패널과 맞춤)
                    borderRadius: '32px',
                    // [수정 포인트] 이미지 자체에 약간의 패딩을 주어 둥근 모서리가 더 잘 보이게 함
                    padding: '10px',
                    transition: 'all 0.5s ease',
                }}
            />
        </CenterPanel>
    );
}