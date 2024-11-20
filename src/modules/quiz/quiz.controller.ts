import {Body, Controller, Get, Param, Post, Put, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {QuizService} from "./quiz.service";
import {CreateQuizDto} from "./models/dto/create-quiz.dto";
import {QuizEntity} from "./models/entity/quiz.entity";
import {UpdateQuizDto} from "./models/dto/update-quiz.dto";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

    @Post("create")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async createQuiz(@Req() req: MaybeAuthenticatedRequest, @Body() body: CreateQuizDto): Promise<QuizEntity>{
        return this.quizService.createQuiz(body.title, body.description, body.difficulty, body.category, req.user);
    }

    @Get(":quiz_id")
    async getQuizById(@Param("quiz_id") quizId: string): Promise<QuizEntity>{
        return this.quizService.getQuizById(quizId);
    }

    @Put(":quiz_id")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async updateQuiz(@Req() req: MaybeAuthenticatedRequest, @Param("quiz_id") quizId: string, @Body() body: UpdateQuizDto): Promise<QuizEntity>{
        return this.quizService.updateQuiz(quizId, body.title, body.questions, req.user, body.description, body.difficulty, body.category);
    }
}
