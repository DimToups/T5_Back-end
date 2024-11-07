import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import CreateQuizDto from "./models/dto/create-quiz.dto";
import {CategoryEntity} from "./models/entities/category.entity";
import {QuizService} from "./quiz.service";
import {CreateQuizResponse} from "./models/responses/create-quiz.response";
import {QuizEntity} from "./models/entities/quiz.entity";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

    @Get(":code")
    @ApiResponse({status: 200, type: QuizEntity})
    async getQuiz(@Param("code") code: string){
        return await this.quizService.getQuizInformations(code);
    }

    @Post("create")
    @ApiResponse({status: 200, type: CreateQuizResponse})
    async createQuiz(@Body() createQuizDto: CreateQuizDto){
        return await this.quizService.createQuiz(createQuizDto.questionCount, createQuizDto.categoryId, createQuizDto.difficultyId);
    }

    @Get("categories")
    @ApiResponse({status: 200, type: CategoryEntity, isArray: true})
    async getCategories(): Promise<CategoryEntity[]>{
        return await this.quizService.getCategories();
    }

    @Get("difficulties")
    @ApiResponse({status: 200, type: CategoryEntity, isArray: true})
    getDifficulties(){
        return this.quizService.getDifficulties();
    }
}
