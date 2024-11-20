import {Body, Controller, Post} from "@nestjs/common";
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

    @Post("generate")
    async generateQuestions(@Body() body: GenerateQuestionDto): Promise<QuestionEntity[]>{
        return this.questionsService.generateQuestions(body.amount, body.difficulty, body.category);
    }
}
