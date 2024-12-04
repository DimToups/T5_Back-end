import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {QuizService} from "./quiz.service";
import {CreateQuizDto} from "./models/dto/create-quiz.dto";
import {QuizEntity} from "./models/entity/quiz.entity";
import {UpdateQuizDto} from "./models/dto/update-quiz.dto";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {PublicQuizEntity} from "./models/entity/public-quiz.entity";
import {FastifyReply} from "fastify";
import {PaginationResponse} from "../../common/models/responses/pagination.response";
import {GetPublicQuizDto} from "./models/dto/get-public-quiz.dto";
import {AuthGuard} from "../users/guards/auth.guard";
import {UserQuizEntity} from "./models/entity/user-quiz.entity";
import {PaginationDto} from "../../common/models/dto/pagination.dto";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

    /**
     * Create a new quiz
     *
     * @throws {500} Internal Server Error
     */
    @Post("create")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async createQuiz(@Req() req: MaybeAuthenticatedRequest, @Body() body: CreateQuizDto): Promise<QuizEntity>{
        return this.quizService.createQuiz(body.title, body.description, body.difficulty, body.category, req.user);
    }

    /**
     * Get a quiz data by its id
     * Only use this route for quiz creation. Quiz information can be found at /quiz/:quiz_id/public
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Get(":quiz_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getQuizById(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string): Promise<QuizEntity>{
        return this.quizService.getQuizDataById(quizId, req.user);
    }

    /**
     * Update a quiz
     *
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {409} Conflict
     * @throws {500} Internal Server Error
     */
    @Put(":quiz_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async updateQuiz(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string, @Body() body: UpdateQuizDto): Promise<QuizEntity>{
        return this.quizService.updateQuiz(quizId, body.title, body.questions, req.user, body.description, body.difficulty, body.category);
    }

    /**
     * Publish a quiz
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Post(":quiz_id/publish")
    @UseGuards(MaybeAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async publishQuiz(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string): Promise<void>{
        return this.quizService.publishQuiz(quizId, req.user);
    }

    /**
     * Get a public quiz by its id
     *
     * @throws {401} Unauthorized
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Get(":quiz_id/public")
    async getPublicQuiz(@Param("quiz_id") quizId: string): Promise<PublicQuizEntity>{
        return this.quizService.getPublicQuiz(quizId);
    }

    /**
     * Get a list of public quizzes
     *
     * @throws {500} Internal Server Error
     */
    @Get("public")
    async getPublicQuizzes(@Res({passthrough: true}) res: FastifyReply, @Query() query: GetPublicQuizDto): Promise<PublicQuizEntity[]>{
        const quiz: PaginationResponse<PublicQuizEntity[]> = await this.quizService.getPublicQuizList(query.search, query.difficulty, query.category, query.take, query.skip);
        res.header("X-Total-Count", quiz.total.toString());
        res.header("X-Take", quiz.take.toString());
        res.header("X-Skip", quiz.skip.toString());
        res.header("access-control-expose-headers", "X-Total-Count, X-Take, X-Skip");
        return quiz.data;
    }

    /**
     * Get user quizzes
     *
     * @throws {401} Unauthorized
     * @throws {500} Internal Server Error
     */
    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async getQuizzes(@Req() req: MaybeAuthenticatedRequest, @Res({passthrough: true}) res: FastifyReply, @Query() query: PaginationDto): Promise<UserQuizEntity[]>{
        const quizzes: PaginationResponse<UserQuizEntity[]> = await this.quizService.getQuizzes(req.user, query.take, query.skip);
        res.header("X-Total-Count", quizzes.total.toString());
        res.header("X-Take", quizzes.take.toString());
        res.header("X-Skip", quizzes.skip.toString());
        res.header("access-control-expose-headers", "X-Total-Count, X-Take, X-Skip");
        return quizzes.data;
    }

    /**
     * Delete a quiz (published or not) if user is its owner
     *
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Delete(":quiz_id")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async deleteQuiz(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string): Promise<void>{
        return this.quizService.deleteQuiz(quizId, req.user);
    }
}
