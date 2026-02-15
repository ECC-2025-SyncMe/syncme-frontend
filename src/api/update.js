import axios from './axios';

//export const fetchUserData = async () => axios.get('/user/data');
//export const fetchUserStats = async () => axios.get('/user/stats');

export const getTodayStatus = async () => axios.get('/status/today'); // 오늘 상태 조회
export const postTodayStatus = async () => axios.post('/status/today'); // 오늘 상태 업데이트(기록)
export const patchTodayStatus = async () => axios.patch('/status/today'); // 오늘 상태 수정

export const characterStatus = async () => axios.get('/character/current'); // 현재 캐릭터 상태
export const characterScore = async () => axios.get('/character/score'); // 캐릭터 점수 조회
export const characterSummary = async () => axios.get('/character/summary'); // 캐릭터 요약 문장

export const calculateStatus = async () => axios.get('/calculate/status'); // 상태 입력 후 계산 결과 반환
export const calculatePreview = async () => axios.get('/calculate/preview'); // 결괏값 기반 미리보기
