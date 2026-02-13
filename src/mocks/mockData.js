// src/mocks/mockData.js

export const MY_INFO = {
    id: 999,
    nickname: "JANE",
    statusMessage: "열공 중 💻",
    bio: "안뇽! 나야.",
    characterType: "vital",
    // 기본 상태 (오늘)
    stats: {
        energy: 80,
        burden: 30,
        passion: 90
    },
    comments: [
        { id: 1, writer: "Ning", text: "멋지당!" },
        { id: 2, writer: "Kari", text: "오늘도 화이팅이야 🔥" },
        { id: 3, writer: "Wint", text: "밥은 먹고 하니? 🍚" }
    ]
};

export const MOCK_FRIENDS = [
    { id: 1, nickname: "Ning", statusMessage: "ningningning", isFollowing: false, isFollower: true, comments: [] },
    { id: 2, nickname: "Gelle", statusMessage: "gellegelle", isFollowing: false, isFollower: false, comments: [] },
    { id: 3, nickname: "Kari", statusMessage: "kakaka", isFollowing: true, isFollower: true, comments: [] },
    { id: 4, nickname: "Wint", statusMessage: "wiwiwi", isFollowing: true, isFollower: false, comments: [] }
];

export const SCORE_HISTORY = [
    { date: '02-03', score: 65 },
    { date: '02-04', score: 40 },
    { date: '02-05', score: 85 },
    { date: '02-06', score: 72 },
];

export const RECORDED_DATES = ["2026-02-01", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06"];

// 날짜를 넣으면 해당 날짜의 가짜 데이터를 반환하는 함수
export const getDailyData = (dateStr) => {
    // 날짜 문자열(예: '2026-02-01')을 이용해 랜덤하지만 고정된 값을 만듦
    const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
        score: (seed * 7) % 100, // 0~100 사이 점수
        stats: {
            energy: (seed * 3) % 100,
            burden: (seed * 5) % 100,
            passion: (seed * 2) % 100
        }
    };
};