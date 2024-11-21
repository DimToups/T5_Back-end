import {Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {GamesService} from "./games.service";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {GameEntity} from "./models/entities/game.entity";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";

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
    @Get(":game_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getGame(@Req() req: MaybeAuthenticatedRequest, @Param("game_id") gameId: string): Promise<GameEntity>{
        return this.gamesService.getGame(gameId, req.user);
    }
}
