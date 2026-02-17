
import React from 'react';
import { Room, RoomType } from '../types';

interface RoomCardProps {
  room: Room;
  isBooked?: boolean;
  isReserved?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, isBooked, isReserved }) => {
  const getStatusColor = () => {
    if (isBooked) return 'bg-rose-50 border-rose-200 text-rose-700';
    if (isReserved) return 'bg-amber-50 border-amber-200 text-amber-700';
    if (room.status === 'cleaning') return 'bg-slate-50 border-slate-200 text-slate-400';
    return 'bg-teal-50 border-teal-200 text-teal-700';
  };

  const getTypeIcon = (type: RoomType) => {
    switch (type) {
      case RoomType.SUITE: return '👑';
      case RoomType.DELUXE: return '✨';
      default: return '🛏️';
    }
  };

  const getStatusText = () => {
    if (isBooked) return 'Occupied';
    if (isReserved) return 'Reserved';
    return 'Vacant';
  };

  return (
    <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xl font-bold">{room.number}</span>
        <span className="text-xs font-semibold px-2 py-1 bg-white/50 rounded-full border border-current/20 uppercase">
          {room.type}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span>{isReserved && !isBooked ? '⏳' : getTypeIcon(room.type)}</span>
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
};

export default RoomCard;
