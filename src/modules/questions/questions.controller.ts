import {Body, Controller, Get, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {QuestionsService} from "./questions.service";
import {QuizGuard} from "../quiz/guards/quiz.guard";
import {QuestionEntity} from "./models/entities/question.entity";
import {SubmitAnswerResponse} from "./models/responses/submit-answer.response";
import {SubmitAnswerDto} from "./models/dto/submit-answer.dto";

@Controller("questions")
@ApiTags("Questions")
@UseGuards(QuizGuard)
export class QuestionsController{
    constructor(
        private readonly questionsService: QuestionsService,
    ){}

    @Post("answer")
    @ApiBearerAuth()
    async submitAnswer(@Req() req: any, @Body() submitAnswerDto: SubmitAnswerDto): Promise<SubmitAnswerResponse>{
        return await this.questionsService.submitAnswer(req.quiz.code, submitAnswerDto.answer);
    }

    @Get("current")
    @ApiBearerAuth()
    async getCurrentQuestion(@Req() req: any): Promise<QuestionEntity>{
        return await this.questionsService.getCurrentQuestion(req.quiz.code);
    }
}
