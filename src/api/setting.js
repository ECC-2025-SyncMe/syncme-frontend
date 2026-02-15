import axios from './axios';

export const ChangeName = async () => axios.patch('/users/me/nickname'); // 프로필 편집(1)
export const settingLogout = async () => axios.post('/auth/logout'); // 로그아웃(2)
export const settingDeleteData = async () => axios.delete('/settings/data'); // 데이터 초기화(3)
export const DeleteAccount = async () => axios.delete('/users/me'); // 계정 삭제(4)
export const getUserInfo = async () => axios.get('/users/me'); // 내 계정 정보 조회(5)
export const settingUserData = async () => axios.get('/settings'); // 설정 정보 조회(6)
