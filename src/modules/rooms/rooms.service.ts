import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException} from "@nestjs/common";
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
import {GameModes, RoomPlayers, Rooms, Teams} from "@prisma/client";
import {TeamEntity} from "./models/entities/team.entity";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {RoomsGateway} from "./rooms.gateway";
import {CompleteRoomEntity} from "./models/entities/complete-room.entity";
import {PublicQuestionEntity} from "../games/models/entities/public-question.entity";
import {QuestionResponse} from "./models/responses/question.response";
import {SubmitAnswerDto} from "../games/models/dto/submit-answer.dto";
import {PublicQuizEntity} from "../quiz/models/entity/public-quiz.entity";
import {QuizService} from "../quiz/quiz.service";

@Injectable()
export class RoomsService{
    private readonly startedRooms: Promise<void>[] = [];
    private readonly playerAnswers: Map<string, string[][]> = new Map<string, string[][]>();
    private readonly logger: Logger = new Logger(RoomsService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly quizService: QuizService,
        private readonly gamesService: GamesService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roomsGatewayService: RoomsGateway,
    ){}

    private async sleep(ms: number): Promise<void>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getRoomData(roomId: string, roomPlayer?: RoomPlayerEntity): Promise<CompleteRoomEntity>{
        const room = await this.prismaService.rooms.findFirst({
            where: {
                game_id: roomId,
            },
            include: {
                game: true,
                room_players: {
                    include: {
                        user: true,
                    },
                },
                teams: true,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        const quiz = await this.quizService.getPublicQuiz(room.game.quiz_id);
        return this.generateCreateRoomResponse(undefined, room.room_players, room, room.teams, quiz, roomPlayer);
    }

    private generateCreateRoomResponse(jwt: string, roomPlayers: any[], room: any, roomTeams: Teams[], quiz: PublicQuizEntity, roomPlayer?: RoomPlayerEntity): CreateRoomResponse{
        return {
            token: jwt,
            selfId: roomPlayer ? roomPlayer.id : undefined,
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
                score: player.score,
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
                score: roomPlayers.filter(player => player.team_id === team.id).reduce((acc, player) => acc + player.score, 0) / roomPlayers.filter(player => player.team_id === team.id).length,
            })),
            quiz,
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
        const roomPlayer = await this.prismaService.roomPlayers.create({
            data: {
                id: this.cipherService.generateUuid(7),
                username: createRoomDto.playerName,
                owner: true,
                room_id: room.game_id,
                user_id: user ? user.id : null,
            },
            include: {
                user: true,
            },
        });
        const quiz = await this.quizService.getPublicQuiz(createRoomDto.quizId);
        const jwt: string = this.jwtService.generateJWT({
            playerId: roomPlayer.id,
            roomId: room.game_id,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return this.generateCreateRoomResponse(jwt, [roomPlayer], room, [], quiz);
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
        const roomPlayer = await this.prismaService.roomPlayers.create({
            data: {
                id: this.cipherService.generateUuid(7),
                username: createRoomDto.playerName,
                owner: true,
                room_id: room.game_id,
                user_id: user ? user.id : null,
            },
            include: {
                user: true,
            },
        });
        const quiz = await this.quizService.getPublicQuiz(createRoomDto.quizId);
        const jwt: string = this.jwtService.generateJWT({
            playerId: roomPlayer.id,
            roomId: room.game_id,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return this.generateCreateRoomResponse(jwt, [roomPlayer], room, teams, quiz);
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
        const playerId = this.cipherService.generateUuid(7);
        const jwt: string = this.jwtService.generateJWT({
            playerId,
            roomId: roomId,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        const roomPlayer = await this.prismaService.roomPlayers.create({
            data: {
                id: playerId,
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
        const quiz = await this.quizService.getPublicQuiz(room.game.quiz_id);
        const response = this.generateCreateRoomResponse(jwt, roomPlayers, room, roomTeams, quiz);
        const exportedResponse = JSON.parse(JSON.stringify(response));
        delete exportedResponse.token;
        this.roomsGatewayService.onRoomUpdate(roomId, {
            room: response.room,
            players: response.players,
            teams: response.teams,
        });
        if(room.game.mode === GameModes.MULTIPLAYER && roomPlayers.length === room.max_players)
            this.startedRooms.push(this.runRoom(exportedResponse));
        return response;
    }

    async joinTeam(roomId: string, playerId: string, teamId: string){
        const room: Rooms = await this.prismaService.rooms.findFirst({
            where: {
                game_id: roomId,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        if(room.started_at)
            throw new BadRequestException("Room has already started");
        const roomPlayer: RoomPlayers = await this.prismaService.roomPlayers.findFirst({
            where: {
                id: playerId,
                room_id: roomId,
            },
        });
        if(!roomPlayer)
            throw new NotFoundException("Room player not found");
        const team: Teams = await this.prismaService.teams.findFirst({
            where: {
                id: teamId,
                room_id: roomId,
            },
        });
        if(!team)
            throw new NotFoundException("Team not found");
        await this.prismaService.roomPlayers.update({
            where: {
                id: playerId,
            },
            data: {
                team_id: teamId,
            },
        });
        this.roomsGatewayService.onRoomUpdate(roomId, await this.getRoomData(roomId));
    }

    private async runRoom(roomData: CompleteRoomEntity): Promise<void>{
        this.logger.debug(`Running room ${roomData.room.id}`);
        roomData.room.startedAt = new Date();
        await this.prismaService.rooms.update({
            where: {
                game_id: roomData.room.id,
            },
            data: {
                started_at: roomData.room.startedAt,
            },
        });
        await this.sleep(5000); // Wait to last client to connect for scrum mode
        this.roomsGatewayService.onRoomStart(roomData.room.id, {
            ...roomData,
            endAt: new Date(Date.now() + 5000), // 5s
        });
        await this.sleep(5000); // 5s
        let questionDuration: number;
        switch (roomData.room.gameMode){
            case GameModes.MULTIPLAYER:
            case GameModes.TEAM_EASY:
                questionDuration = 30000; // 30s
                break;
            case GameModes.TEAM_MEDIUM:
                questionDuration = 15000; // 15s
                break;
            case GameModes.TEAM_HARD:
                questionDuration = 5000; // 5s
                break;
        }
        const questionCount: number = await this.gamesService.getQuestionCount(roomData.room.id);
        this.playerAnswers.set(roomData.room.id, Array.from({length: questionCount}));
        for(let i: number = 0; i < questionCount; i++){
            const question: PublicQuestionEntity = await this.gamesService.getCurrentQuestion(roomData.room.id);
            this.roomsGatewayService.onQuestionStart(roomData.room.id, {
                question,
                endAt: new Date(Date.now() + questionDuration),
            } as QuestionResponse);
            const correctAnswer = await this.gamesService.getCorrectAnswer(question.sum);
            const start = Date.now();
            while(Date.now() - start < questionDuration){
                // Check if all players have answered
                this.logger.debug(`${this.playerAnswers.get(roomData.room.id)[i]?.length || 0} players answered for room ${roomData.room.id} (question ${i})`);
                if(this.playerAnswers.get(roomData.room.id)[i]?.length || 0 === roomData.players.length){
                    this.logger.debug(`All players answered for room ${roomData.room.id}, starting next question`);
                    break;
                }
                await this.sleep(250);
            }
            this.roomsGatewayService.onQuestionEnd(roomData.room.id, {
                ...await this.getRoomData(roomData.room.id),
                correctAnswer,
                endAt: new Date(Date.now() + 5000), // 5s
            });
            await this.sleep(5000); // 5s
            await this.gamesService.nextQuestion(roomData.room.id);
        }
        this.logger.debug(`Ending room ${roomData.room.id}`);
        this.roomsGatewayService.onRoomEnd(roomData.room.id, await this.getRoomData(roomData.room.id));
    }

    async startRoom(roomId: string, playerId: string){
        const room = await this.prismaService.rooms.findFirst({
            where: {
                game_id: roomId,
            },
            include: {
                game: true,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        if(room.started_at)
            throw new BadRequestException("Room has already started");
        const roomPlayer: RoomPlayers = await this.prismaService.roomPlayers.findFirst({
            where: {
                id: playerId,
                room_id: roomId,
            },
        });
        if(!roomPlayer)
            throw new NotFoundException("Room player not found");
        if(!roomPlayer.owner)
            throw new ForbiddenException("Room player is not room owner");
        this.startedRooms.push(this.runRoom(await this.getRoomData(roomId)));
    }

    async answerQuestion(roomId: string, playerId: string, submitAnswerDto: SubmitAnswerDto): Promise<void>{
        const room = await this.prismaService.rooms.findFirst({
            where: {
                game_id: roomId,
            },
            include: {
                game: true,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        if(!room.started_at)
            throw new BadRequestException("Room has not started yet");
        const roomPlayers = await this.prismaService.roomPlayers.findMany({
            where: {
                room_id: roomId,
            },
        });
        if(!roomPlayers.find(player => player.id === playerId))
            throw new NotFoundException("Room player not found");
        const currentQuestion = await this.gamesService.getCurrentQuestion(roomId);
        // Check if player has already answered and store its answer state to memory
        let currentQuestionAnswers: string[] = this.playerAnswers.get(roomId)[currentQuestion.position] || [];
        if(currentQuestionAnswers.includes(playerId))
            throw new BadRequestException("Player has already answered");
        currentQuestionAnswers.push(playerId);
        this.playerAnswers.set(roomId, {
            ...this.playerAnswers.get(roomId),
            [currentQuestion.position]: currentQuestionAnswers,
        });
        // Check answer and calculate score
        const isAnswerCorrect = await this.gamesService.isAnswerCorrect(currentQuestion.sum, submitAnswerDto.answer);
        if(isAnswerCorrect)
            await this.prismaService.roomPlayers.update({
                where: {
                    id: playerId,
                },
                data: {
                    score: {
                        increment: 1,
                    },
                },
            });
        // If correct answer for scrum mode, fill answer for all players to trigger next question
        if(isAnswerCorrect && room.game.mode === GameModes.MULTIPLAYER){
            this.logger.debug("Correct answer found, complete player answers to trigger next question");
            this.playerAnswers.set(roomId, {
                ...this.playerAnswers.get(roomId),
                [currentQuestion.position]: roomPlayers.map(player => player.id),
            });
        }
        // Trigger update for clients
        this.roomsGatewayService.onPlayerAnswer(roomId, this.playerAnswers.get(roomId)[currentQuestion.position]);
    }
}
