import {RoomEntity} from "./room.entity";
import {RoomPlayerEntity} from "./room-player.entity";
import {TeamEntity} from "./team.entity";

export class CompleteRoomEntity{
    room: RoomEntity;
    players: RoomPlayerEntity[];
    teams?: TeamEntity[];
}
