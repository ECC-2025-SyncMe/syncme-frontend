import api from './index';

export const getFriendList = () => api.get('/friends');
export const followUser = (userId) => api.post(`/friends/${userId}`);
export const unfollowUser = (userId) => api.delete(`/friends/${userId}`);
export const getFollowing = () => api.get('/friends/following');