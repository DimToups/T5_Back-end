import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
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

@Injectable()
export class WsRoomAuthGuard implements CanActivate{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    private extractTokenFromHeader(request: Handshake): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async authenticate(socket: AuthenticatedSocketEntity): Promise<boolean>{
        const token: string = this.extractTokenFromHeader(socket.handshake);
        if(!token)
            throw new WsException("Session id not found in headers");
        const decodedToken: any = this.jwtService.verifyJWT(token, this.configService.get<string>("JWT_SECRET"));
        const roomId: string = decodedToken.roomId;
        const playerId: string = decodedToken.playerId;
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                game_id: roomId,
            },
        });
        if(!room)
            throw new WsException("Room not found");
        const player = await this.prismaService.roomPlayers.findFirst({
            where: {
                id: playerId,
            },
            include: {
                user: true,
            },
        });
        if(!player)
            throw new WsException("Player not found");
        socket.room = {
            maxPlayers: room.max_players,
            gameId: room.game_id,
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

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const socket: AuthenticatedSocketEntity = context.switchToWs().getClient<AuthenticatedSocketEntity>();
        return await this.authenticate(socket);
    }
}
