
import { RoomType, Room } from './types';

export const ROOM_PRICES = {
  [RoomType.SUPERIOR]: 430000,
  [RoomType.DELUXE]: 738000,
  [RoomType.SUITE]: 938000,
};

export const generateRooms = (): Room[] => {
  const rooms: Room[] = [];

  // Floor 1: 101 - 121
  for (let i = 101; i <= 121; i++) {
    let type = RoomType.SUPERIOR;
    if (i === 109) type = RoomType.SUITE;
    rooms.push({
      number: i.toString(),
      type,
      price: ROOM_PRICES[type],
      status: 'available',
    });
  }

  // Floor 2: 201 - 220
  for (let i = 201; i <= 220; i++) {
    let type = RoomType.SUPERIOR;
    rooms.push({
      number: i.toString(),
      type,
      price: ROOM_PRICES[type],
      status: 'available',
    });
  }

  // Floor 3: 301 - 321
  for (let i = 301; i <= 321; i++) {
    let type = RoomType.SUPERIOR;
    if (i === 309) type = RoomType.SUITE;
    else if (i >= 306 && i <= 308) type = RoomType.DELUXE;
    
    rooms.push({
      number: i.toString(),
      type,
      price: ROOM_PRICES[type],
      status: 'available',
    });
  }

  return rooms;
};
