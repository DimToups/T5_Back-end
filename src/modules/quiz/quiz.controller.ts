import {Body, Controller, Get, Post} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import CreateQuizDto from "./models/dto/create-quiz.dto";
import {CategoryEntity} from "./models/entities/category.entity";
import {QuizService} from "./quiz.service";
import {CreateQuizResponse} from "./models/responses/create-quiz.response";

@Controller()
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

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
