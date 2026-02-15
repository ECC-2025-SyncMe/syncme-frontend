import React from 'react';
import {
    LineChart, Line, BarChart, Bar, Cell, LabelList,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { theme } from '../../styles/theme';

import { Panel, SectionTitle, ChartContainer, ScoreContainer, Spacer } from './RightChartPanelStyles';

export default function RightChartPanel({ historyData, score }) {
    const barData = [{ name: 'Score', value: score }];

    return (
        <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                <ChartContainer>
                    <SectionTitle>최근 점수 변화 <span>Recent Score Changes</span></SectionTitle>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />

                            {/* [수정] dataKey를 'shortDate'로 변경하여 MM-DD 형식으로 표시 */}
                            <XAxis
                                dataKey="shortDate"
                                stroke="#666"
                                tickLine={false}
                                tick={{ fontSize: 11 }}
                                interval={0}
                                padding={{ left: 10, right: 10 }}
                            />

                            <YAxis hide domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: theme.colors.panel,
                                    border: `1px solid ${theme.colors.textTertiary}`
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke={theme.colors.chartLine}
                                strokeWidth={3}
                                dot={{ r: 3, fill: theme.colors.chartLine, stroke: '#fff' }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <Spacer />

                <ScoreContainer>
                    <div className="bar-wrapper">
                        <div className="bar-box">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 0, bottom: 0 }}>
                                    <YAxis hide domain={[0, 100]} />
                                    <Bar
                                        dataKey="value"
                                        radius={[15, 15, 0, 0]}
                                        barSize={60}
                                        isAnimationActive={true}
                                    >
                                        <Cell fill={theme.colors.primary} />
                                        <LabelList
                                            dataKey="value"
                                            position="insideTop"
                                            fill="#ffffff"
                                            fontWeight="bold"
                                            fontSize={20}
                                            dy={10}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <p className="score-label">Score</p>
                </ScoreContainer>

            </div>
        </Panel>
    );
}