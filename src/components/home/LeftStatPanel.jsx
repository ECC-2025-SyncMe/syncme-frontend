import React from 'react';
import { FaBolt, FaWeightHanging, FaFire } from 'react-icons/fa';
import { theme } from '../../styles/theme';

import { Panel, SectionTitle, StatList, StatItemContainer } from './LeftStatPanelStyles';

export default function LeftStatPanel({ stats }) {
    return (
        <Panel>
            <SectionTitle>오늘의 상태 <span>Status</span></SectionTitle>
            <StatList>
                <StatItem
                    icon={FaBolt}
                    name="ENERGY"
                    value={stats.energy}
                    color={theme.colors.status.energy}
                />
                <StatItem
                    icon={FaWeightHanging}
                    name="PRESSURE"
                    value={stats.burden}
                    color={theme.colors.status.burden}
                />
                <StatItem
                    icon={FaFire}
                    name="PASSION"
                    value={stats.passion}
                    color={theme.colors.status.passion}
                />
            </StatList>
        </Panel>
    );
}

// 반복되는 부분은 내부 컴포넌트로 분리
function StatItem({ icon: Icon, name, value, color }) {
    return (
        <StatItemContainer color={color}>
            <div className="label-row">
                <Icon className="icon" />
                <span className="name">{name}</span>
                <span className="value">{value}%</span>
            </div>
            <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${value}%` }}></div>
            </div>
        </StatItemContainer>
    );
}