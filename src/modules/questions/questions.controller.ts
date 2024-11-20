import {Body, Controller, Get, HttpCode, HttpStatus, Post, Query} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {QuestionsService} from "./questions.service";
import {QuestionEntity} from "./models/entities/question.entity";
import {GenerateQuestionDto} from "./models/dto/generate-question.dto";

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
    async getQuestions(@Query() query: GenerateQuestionDto): Promise<QuestionEntity[]>{
        return this.questionsService.getQuestions(query.amount, query.difficulty, query.category);
    }
}
