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
import {RoomPlayers, Teams} from "@prisma/client";
import {TeamEntity} from "./models/entities/team.entity";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {RoomsGateway} from "./rooms.gateway";
import {CompleteRoomEntity} from "./models/entities/complete-room.entity";
import {PublicQuestionEntity} from "../games/models/entities/public-question.entity";

@Injectable()
export class RoomsService{
    private readonly startedRooms: Promise<void>[] = [];

    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesService: GamesService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roomsGatewayService: RoomsGateway,
    ){}

    private generateCreateRoomResponse(jwt: string, roomPlayers: any[], room: any, roomTeams: Teams[]): CreateRoomResponse{
        return {
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
                gameMode: room.game.mode,
            } as RoomEntity,
            teams: roomTeams.map((team: Teams): TeamEntity => ({
                roomId: team.room_id,
                name: team.name,
                id: team.id,
            })),
        } as CreateRoomResponse;
    }

    async createScrumRoom(createRoomDto: CreateRoomDto, user?: UserEntity): Promise<CreateRoomResponse>{
        if(!createRoomDto.maxPlayers)
            throw new BadRequestException("Max players required for scrum room");
        const game: GameEntity = await this.gamesService.startGame(createRoomDto.quizId, null, createRoomDto.gameMode);
        const room = await this.prismaService.rooms.create({
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                max_players: createRoomDto.maxPlayers,
            },
            include: {
                game: true,
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
        return this.generateCreateRoomResponse(jwt, [roomPlayer], room, []);
    }

    async createTeamRoom(createRoomDto: CreateRoomDto, user?: UserEntity): Promise<CreateRoomResponse>{
        if(!createRoomDto.teams)
            throw new BadRequestException("Teams required for team room");
        const game: GameEntity = await this.gamesService.startGame(createRoomDto.quizId, null, createRoomDto.gameMode);
        const room = await this.prismaService.rooms.create({
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
            },
            include: {
                game: true,
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
        return this.generateCreateRoomResponse(jwt, [roomPlayer], room, teams);
    }

    async joinRoom(roomId: string, body: JoinRoomDto, user?: UserEntity): Promise<CreateRoomResponse>{
        const room = await this.prismaService.rooms.findUnique({
            where: {
                game_id: roomId,
            },
            include: {
                game: true,
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
        if(room.max_players && roomPlayers.length >= room.max_players)
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
        const response = this.generateCreateRoomResponse(jwt, roomPlayers, room, roomTeams);
        this.roomsGatewayService.onRoomUpdate(roomId, {
            room: response.room,
            players: response.players,
            teams: response.teams,
        });
        if(room.game.mode === "MULTIPLAYER" && roomPlayers.length === room.max_players)
            this.startedRooms.push(this.startScrumRoom(response));
        return response;
    }

    private async sleep(ms: number): Promise<void>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async startScrumRoom(roomData: CompleteRoomEntity): Promise<void>{
        roomData.room.startedAt = new Date();
        await this.prismaService.rooms.update({
            where: {
                game_id: roomData.room.id,
            },
            data: {
                started_at: roomData.room.startedAt,
            },
        });
        this.roomsGatewayService.onRoomStart(roomData.room.id, {
            ...roomData,
            endAt: new Date(Date.now() + 5000), // 5s
        });
        await this.sleep(5000); // 5s
        const question: PublicQuestionEntity = await this.gamesService.getCurrentQuestion(roomData.room.id);
        this.roomsGatewayService.onQuestionStart(roomData.room.id, {

        });
    }

    private async startTeamRoom(roomData: CompleteRoomEntity): Promise<void>{
        roomData.room.startedAt = new Date();
        await this.prismaService.rooms.update({
            where: {
                game_id: roomData.room.id,
            },
            data: {
                started_at: roomData.room.startedAt,
            },
        });
        this.roomsGatewayService.onRoomStart(roomData.room.id, {
            ...roomData,
            endAt: new Date(Date.now() + 5000), // 5s
        });
        await this.sleep(5000); // 5s
    }
}
