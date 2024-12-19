import {BadRequestException, Injectable} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {UserEntity} from "../users/models/entities/user.entity";
import {GamesService} from "../games/games.service";
import {GameEntity} from "../games/models/entities/game.entity";
import {CipherService} from "../../common/services/cipher.service";
import {JwtService} from "../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {CreateRoomResponse} from "./models/responses/create-room.response";
import {RoomEntity} from "./models/entities/room.entity";
import {RoomPlayerEntity} from "./models/entities/room-player.entity";
import {RoomPlayers, Rooms, Teams} from "@prisma/client";
import {TeamEntity} from "./models/entities/team.entity";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {RoomsGateway} from "./rooms.gateway";

@Injectable()
export class RoomsService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesService: GamesService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roomsGatewayService: RoomsGateway,
    ){}

    async createScrumRoom(createRoomDto: CreateRoomDto, user?: UserEntity): Promise<CreateRoomResponse>{
        if(!createRoomDto.maxPlayers)
            throw new BadRequestException("Max players required for scrum room");
        const game: GameEntity = await this.gamesService.startGame(createRoomDto.quizId, user, createRoomDto.gameMode);
        const room = await this.prismaService.rooms.create({
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                max_players: createRoomDto.maxPlayers,
            },
        });
        const roomPlayer: RoomPlayers = await this.prismaService.roomPlayers.create({
            data: {
                id: this.cipherService.generateUuid(7),
                room_id: room.game_id,
                user_id: user ? user.id : null,
                username: createRoomDto.playerName,
                owner: true,
            },
        });
        const jwt: string = this.jwtService.generateJWT({
            playerId: roomPlayer.id,
            roomId: room.game_id,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return {
            token: jwt,
            players: [{
                id: roomPlayer.id,
                username: roomPlayer.username,
                owner: roomPlayer.owner,
                roomId: roomPlayer.room_id,
                user: user
                    ? {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    } as UserEntity
                    : null,
            } as RoomPlayerEntity],
            room: {
                id: room.game_id,
                maxPlayers: room.max_players,
                startedAt: room.started_at,
            } as RoomEntity,
        } as CreateRoomResponse;
    }

    async createTeamRoom(createRoomDto: CreateRoomDto, user?: UserEntity): Promise<CreateRoomResponse>{
        if(!createRoomDto.teams)
            throw new BadRequestException("Teams required for team room");
        const game: GameEntity = await this.gamesService.startGame(createRoomDto.quizId, user, createRoomDto.gameMode);
        const room = await this.prismaService.rooms.create({
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
            },
        });
        await this.prismaService.teams.createMany({
            data: createRoomDto.teams.map(teamName => ({
                id: this.cipherService.generateUuid(7),
                room_id: room.game_id,
                name: teamName,
            })),
        });
        const teams: Teams[] = await this.prismaService.teams.findMany({
            where: {
                room_id: room.game_id,
            },
        });
        const roomPlayer: RoomPlayers = await this.prismaService.roomPlayers.create({
            data: {
                id: this.cipherService.generateUuid(7),
                room_id: room.game_id,
                user_id: user ? user.id : null,
                username: createRoomDto.playerName,
                owner: true,
            },
        });
        const jwt: string = this.jwtService.generateJWT({
            playerId: roomPlayer.id,
            roomId: room.game_id,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return {
            token: jwt,
            players: [{
                id: roomPlayer.id,
                username: roomPlayer.username,
                owner: roomPlayer.owner,
                roomId: roomPlayer.room_id,
                user: user
                    ? {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    } as UserEntity
                    : null,
            } as RoomPlayerEntity],
            room: {
                id: room.game_id,
                maxPlayers: room.max_players,
                startedAt: room.started_at,
            } as RoomEntity,
            teams: teams.map((team: Teams): TeamEntity => ({
                id: team.id,
                name: team.name,
                roomId: team.room_id,
            })),
        } as CreateRoomResponse;
    }

    async joinRoom(roomId: string, body: JoinRoomDto, user?: UserEntity){
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                game_id: roomId,
            },
        });
        if(!room)
            throw new BadRequestException("Room does not exist");
        if(room.started_at)
            throw new BadRequestException("Room has already started");
        const roomPlayers = await this.prismaService.roomPlayers.findMany({
            where: {
                room_id: roomId,
            },
            include: {
                user: true,
            },
        });
        if(roomPlayers.length >= room.max_players)
            throw new BadRequestException("Room is full");
        const jwt: string = this.jwtService.generateJWT({
            playerId: this.cipherService.generateUuid(7),
            roomId: roomId,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        const roomPlayer = await this.prismaService.roomPlayers.create({
            data: {
                id: this.cipherService.generateUuid(7),
                room_id: roomId,
                user_id: user ? user.id : null,
                username: body.playerName,
                owner: false,
            },
            include: {
                user: true,
            },
        });
        roomPlayers.push(roomPlayer);
        const roomTeams: Teams[] = await this.prismaService.teams.findMany({
            where: {
                room_id: roomId,
            },
        });
        const response = {
            token: jwt,
            players: roomPlayers.map((player): RoomPlayerEntity => ({
                id: player.id,
                username: player.username,
                owner: player.owner,
                roomId: player.room_id,
                user: player.user
                    ? {
                        id: player.user.id,
                        username: player.user.username,
                        email: player.user.email,
                    } as UserEntity
                    : null,
                teamId: player.team_id,
            })),
            room: {
                id: room.game_id,
                maxPlayers: room.max_players,
                startedAt: room.started_at,
            } as RoomEntity,
            teams: roomTeams.map((team: Teams): TeamEntity => ({
                roomId: team.room_id,
                name: team.name,
                id: team.id,
            })),
        } as CreateRoomResponse;
        this.roomsGatewayService.onRoomUpdate(roomId, {
            room: response.room,
            players: response.players,
            teams: response.teams,
        });
        return response;
    }
}
