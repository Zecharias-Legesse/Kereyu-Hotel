export type RoomType = 'SINGLE' | 'DOUBLE' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';

export interface RoomRequest {
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  capacity: number;
  description?: string;
  amenities?: string;
  floor: number;
  imageUrl?: string;
}

export interface RoomResponse {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  capacity: number;
  description: string;
  amenities: string;
  floor: number;
  status: RoomStatus;
  imageUrl: string;
}
