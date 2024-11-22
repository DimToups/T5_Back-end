import {Body, Controller, Get, NotImplementedException, Param, Post, Query, Req, Res, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {GamesService} from "./games.service";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {GameEntity} from "./models/entities/game.entity";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {AuthGuard} from "../users/guards/auth.guard";
import {AuthenticatedRequest} from "../users/models/models/authenticated-request";
import {PublicQuestionEntity} from "./models/entities/public-question.entity";
import {SubmitAnswerDto} from "./models/dto/submit-answer.dto";
import {SubmitAnswerResponse} from "./models/submit-answer.response";
import {GenerateQuestionDto} from "../questions/models/dto/generate-question.dto";
import {FastifyReply} from "fastify";
import {PaginationDto} from "../../common/models/dto/pagination.dto";
import {PaginationResponse} from "../../common/models/responses/pagination.response";

@Controller("games")
@ApiTags("Games")
export class GamesController{
    constructor(
        private readonly gamesService: GamesService,
    ){}

    /**
     * Start a new game
     *
     * @throws {401} UnauthorizedException
     * @throws {404} NotFoundException
     * @throws {500} InternalServerErrorException
     */
    @Post("new/:quiz_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async startGame(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string): Promise<GameEntity>{
        return this.gamesService.startGame(quizId, req.user);
    }

    /**
     * Get started game information
     *
     * @throws {401} UnauthorizedException
     * @throws {403} ForbiddenException
     * @throws {404} NotFoundException
     * @throws {500} InternalServerErrorException
     */
    @Get("id/:game_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getGame(@Req() req: MaybeAuthenticatedRequest, @Param("game_id") gameId: string): Promise<GameEntity>{
        return this.gamesService.getGame(gameId, req.user);
    }

    @Get("code/:game_code")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getGameByCode(@Req() req: MaybeAuthenticatedRequest, @Param("game_code") gameCode: string): Promise<GameEntity>{
        return this.gamesService.getGameByCode(gameCode, req.user);
    }

    /**
     * Get all user games
     *
     * @throws {401} UnauthorizedException
     * @throws {500} InternalServerErrorException
     */
    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async getGames(@Req() req: AuthenticatedRequest, @Res({passthrough: true}) res: FastifyReply, @Query() query: PaginationDto): Promise<GameEntity[]>{
        const games: PaginationResponse<GameEntity[]> = await this.gamesService.getGames(req.user.id, query.take, query.skip);
        res.header("X-Total-Count", games.total.toString());
        res.header("X-Take", games.take.toString());
        res.header("X-Skip", games.skip.toString());
        return games.data;
    }

    /**
     * Get game statistics (WIP)
     *
     * @throws {501} NotImplementedException
     */
    @Get(":game_id/statistics")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async getGameStatistics(): Promise<void>{
        throw new NotImplementedException();
    }

    /**
     * Get current question of a game
     *
     * @throws {401} UnauthorizedException
     * @throws {403} ForbiddenException
     * @throws {404} NotFoundException
     * @throws {500} InternalServerErrorException
     */
    @Get(":game_id/question")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getQuestion(@Req() req: MaybeAuthenticatedRequest, @Param("game_id") gameId: string): Promise<PublicQuestionEntity>{
        return this.gamesService.getCurrentQuestion(gameId, req.user);
    }

    /**
     * Submit an answer for the current question
     *
     * @throws {401} UnauthorizedException
     * @throws {403} ForbiddenException
     * @throws {404} NotFoundException
     * @throws {500} InternalServerErrorException
     */
    @Post(":game_id/answer")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async answerQuestion(@Req() req: MaybeAuthenticatedRequest, @Param("game_id") gameId: string, @Body() body: SubmitAnswerDto): Promise<SubmitAnswerResponse>{
        return this.gamesService.answerQuestion(gameId, body.answer, req.user);
    }

    /**
     * Create a quick game
     *
     * @throws {400} BadRequestException
     * @throws {500} InternalServerErrorException
     */
    @Post("quick")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async quickGame(@Req() req: MaybeAuthenticatedRequest, @Body() body: GenerateQuestionDto): Promise<GameEntity>{
        return this.gamesService.createQuickGame(body.amount, body.difficulty, body.category, req.user);
    }
}
