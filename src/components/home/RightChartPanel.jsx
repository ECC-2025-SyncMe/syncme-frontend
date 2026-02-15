import React from 'react';
import {
    LineChart, Line, BarChart, Bar, Cell, LabelList,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { theme } from '../../styles/theme';

import { Panel, SectionTitle, ChartContainer, ScoreContainer, Spacer } from './RightChartPanelStyles';

export default function RightChartPanel({ historyData, score }) {
    // historyData가 있고 길이가 1 이상인지 확인
    const hasHistory = historyData && historyData.length > 0;

    // score가 유효한지 확인 (없으면 0)
    const currentScore = score || 0;
    const barData = [{ name: 'Score', value: currentScore }];

    return (
        <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                <ChartContainer>
                    <SectionTitle>최근 점수 변화 <span>Recent Score Changes</span></SectionTitle>

                    {/* [수정 포인트] 데이터가 있을 때만 차트를 렌더링 */}
                    {hasHistory ? (
                        <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={historyData.length > 0 ? historyData : [{ shortDate: '-', score: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />

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
                                        border: `1px solid ${theme.colors.textTertiary}`,
                                        borderRadius: '8px'
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
                    ) : (
                        // 데이터가 없을 때 보여줄 대체 UI
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666',
                            fontSize: '0.9rem'
                        }}>
                            아직 기록된 데이터가 없어요.
                        </div>
                    )}
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