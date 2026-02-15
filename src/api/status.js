import api from './index';

export const getTodayStatus = () => api.get('/status/today');
export const getCharacterStatus = () => api.get('/character/current');
export const getCharacterScore = () => api.get('/character/score');