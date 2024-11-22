import {Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {QuestionsService} from "./questions.service";
import {QuestionEntity} from "./models/entities/question.entity";
import {GenerateQuestionDto} from "./models/dto/generate-question.dto";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {GetQuestionsDto} from "./models/dto/get-questions.dto";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {PaginationResponse} from "../../common/models/responses/pagination.response";
import {FastifyReply} from "fastify";

@Controller("questions")
@ApiTags("Questions")
export class QuestionsController{
    constructor(
        private readonly questionsService: QuestionsService,
    ){}

    /**
     * Generate questions from open trivia database
     *
     * @throws {500} Internal Server Error
     */
    @Post("generate")
    @HttpCode(HttpStatus.OK)
    async generateQuestions(@Body() body: GenerateQuestionDto): Promise<QuestionEntity[]>{
        return this.questionsService.generateQuestions(body.amount, body.difficulty, body.category);
    }

    /**
     * Get questions from database
     *
     * @throws {500} Internal Server Error
     */
    @Get()
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async getQuestions(@Req() req: MaybeAuthenticatedRequest, @Res({passthrough: true}) res: FastifyReply, @Query() query: GetQuestionsDto): Promise<QuestionEntity[]>{
        const questions: PaginationResponse<QuestionEntity[]> = await this.questionsService.getQuestions(req.user, query.search, query.difficulty, query.category, query.take, query.skip);
        res.header("X-Total-Count", questions.total.toString());
        res.header("X-Take", questions.take.toString());
        res.header("X-Skip", questions.skip.toString());
        res.header("access-control-expose-headers", "X-Total-Count, X-Take, X-Skip");
        return questions.data;
    }
}
