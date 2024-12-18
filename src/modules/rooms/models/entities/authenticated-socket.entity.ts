import {Socket} from "socket.io";
import {RoomEntity} from "./room.entity";
import {RoomPlayerEntity} from "./room-player.entity";

export class AuthenticatedSocketEntity extends Socket{
    room: RoomEntity;
    player: RoomPlayerEntity;
}
