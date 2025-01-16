import {FastifyRequest} from "fastify";
import {RoomEntity} from "./room.entity";
import {RoomPlayerEntity} from "./room-player.entity";

export interface AuthenticatedRequestEntity extends FastifyRequest{
    room: RoomEntity;
    player: RoomPlayerEntity;
}
