import { atom } from 'recoil';

export const currentRoomId = atom({
  key: 'currentRoomId',
  default: null,
});