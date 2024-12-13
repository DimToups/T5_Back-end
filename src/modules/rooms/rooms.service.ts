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
import {Teams} from "@prisma/client";
import {TeamEntity} from "./models/entities/team.entity";

@Injectable()
export class RoomsService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesService: GamesService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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
        const roomPlayer = await this.prismaService.roomPlayers.create({
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
                gameId: room.game_id,
                maxPlayers: room.max_players,
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
        const roomPlayer = await this.prismaService.roomPlayers.create({
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
                gameId: room.game_id,
                maxPlayers: room.max_players,
            } as RoomEntity,
            teams: teams.map((team: Teams): TeamEntity => ({
                id: team.id,
                name: team.name,
                roomId: team.room_id,
            })),
        } as CreateRoomResponse;
    }
}
