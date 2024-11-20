import {Body, Controller, Get, Param, Post, Put} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {QuizService} from "./quiz.service";
import {CreateQuizDto} from "./models/dto/create-quiz.dto";
import {QuizEntity} from "./models/entity/quiz.entity";
import {UpdateQuizDto} from "./models/dto/update-quiz.dto";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

    @Post("create")
    async createQuiz(@Body() body: CreateQuizDto): Promise<QuizEntity>{
        return this.quizService.createQuiz(body.title, body.description, body.difficulty, body.category);
    }

    @Get(":quiz_id")
    async getQuizById(@Param("quiz_id") quizId: string): Promise<QuizEntity>{
        console.log(quizId);
        return this.quizService.getQuizById(quizId);
    }

    @Put(":quiz_id")
    async updateQuiz(@Param("quiz_id") quizId: string, @Body() body: UpdateQuizDto): Promise<QuizEntity>{
        return this.quizService.updateQuiz(quizId, body.title, body.questions, body.description, body.difficulty, body.category);
    }
}
