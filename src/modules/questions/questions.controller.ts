import {Body, Controller, Get, HttpStatus, NotFoundException, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
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
    @ApiResponse({status: HttpStatus.OK, description: "Answer submitted successfully", type: SubmitAnswerResponse})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "Question not found"})
    async submitAnswer(@Req() req: any, @Body() submitAnswerDto: SubmitAnswerDto): Promise<SubmitAnswerResponse>{
        return await this.questionsService.submitAnswer(req.quiz, submitAnswerDto.answer);
    }

    @Get("current")
    @ApiBearerAuth()
    @ApiResponse({status: HttpStatus.OK, description: "Current question retrieved successfully", type: QuestionEntity})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "No more questions available"})
    async getCurrentQuestion(@Req() req: any): Promise<QuestionEntity>{
        const currentQuestion = await this.questionsService.getCurrentQuestion(req.quiz.code);
        if(!currentQuestion)
            throw new NotFoundException("No more questions available.");
        return currentQuestion;
    }
}
