import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {WsException} from "@nestjs/websockets";
import {Rooms} from "@prisma/client";
import {PrismaService} from "../../../common/services/prisma.service";
import {JwtService} from "../../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {AuthenticatedSocketEntity} from "../models/entities/authenticated-socket.entity";
import {RoomEntity} from "../models/entities/room.entity";
import {RoomPlayerEntity} from "../models/entities/room-player.entity";
import {UserEntity} from "../../users/models/entities/user.entity";
import {Handshake} from "socket.io/dist/socket-types";
import {FastifyRequest} from "fastify";
import {AuthenticatedRequestEntity} from "../models/entities/authenticated-request.entity";

@Injectable()
export class RoomAuthGuard implements CanActivate{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest | Handshake): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async wsAuthenticate(socket: AuthenticatedSocketEntity): Promise<boolean>{
        const token: string = this.extractTokenFromHeader(socket.handshake);
        if(!token)
            throw new WsException("JWT not found in headers");
        const {room, player} = await this.authenticate(token);
        if(!room)
            throw new WsException("Room not found");
        if(!player)
            throw new WsException("Player not found");
        socket.room = {
            maxPlayers: room.max_players,
            id: room.game_id,
            startedAt: room.started_at,
        } as RoomEntity;
        socket.player = {
            id: player.id,
            username: player.username,
            owner: player.owner,
            roomId: player.room_id,
            teamId: player.team_id,
            user: {
                id: player.user?.id,
                username: player.user?.username,
                email: player.user?.email,
            } as UserEntity,
        } as RoomPlayerEntity;
        return true;
    }

    async httpAuthenticate(request: AuthenticatedRequestEntity): Promise<boolean>{
        const token: string = this.extractTokenFromHeader(request);
        if(!token)
            throw new UnauthorizedException("JWT not found in headers");
        const {room, player} = await this.authenticate(token);
        if(!room)
            throw new UnauthorizedException("Room not found");
        if(!player)
            throw new UnauthorizedException("Player not found");
        request.room = {
            maxPlayers: room.max_players,
            id: room.game_id,
            startedAt: room.started_at,
        } as RoomEntity;
        request.player = {
            id: player.id,
            username: player.username,
            owner: player.owner,
            roomId: player.room_id,
            teamId: player.team_id,
            user: {
                id: player.user?.id,
                username: player.user?.username,
                email: player.user?.email,
            } as UserEntity,
        } as RoomPlayerEntity;
        return true;
    }

    private async authenticate(token: string){
        const decodedToken: any = this.jwtService.verifyJWT(token, this.configService.get<string>("JWT_SECRET"));
        const roomId: string = decodedToken.roomId;
        const playerId: string = decodedToken.playerId;
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                game_id: roomId,
            },
        });
        if(!room)
            return {};
        const player = await this.prismaService.roomPlayers.findFirst({
            where: {
                id: playerId,
            },
            include: {
                user: true,
            },
        });
        if(!player)
            return {room};
        return {
            room,
            player,
        };
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request: AuthenticatedRequestEntity = context.switchToHttp().getRequest();
        return await this.httpAuthenticate(request);
    }
}
