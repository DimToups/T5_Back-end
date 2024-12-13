import {RoomEntity} from "../entities/room.entity";
import {RoomPlayerEntity} from "../entities/room-player.entity";
import {TeamEntity} from "../entities/team.entity";

export class CreateRoomResponse{
    token: string;
    room: RoomEntity;
    players: RoomPlayerEntity[];
    teams?: TeamEntity[];
}
