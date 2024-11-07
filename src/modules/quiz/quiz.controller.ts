import {Body, Controller, Get, HttpStatus, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import CreateQuizDto from "./models/dto/create-quiz.dto";
import {CategoryEntity} from "./models/entities/category.entity";
import {QuizService} from "./quiz.service";
import {CreateQuizResponse} from "./models/responses/create-quiz.response";
import {QuizEntity} from "./models/entities/quiz.entity";
import {QuizGuard} from "./guards/quiz.guard";

@Controller("quiz")
@ApiTags("Quiz")
export class QuizController{
    constructor(
        private readonly quizService: QuizService,
    ){}

    @Get()
    @UseGuards(QuizGuard)
    @ApiBearerAuth()
    @ApiResponse({status: HttpStatus.OK, description: "Quiz information retrieved successfully", type: QuizEntity})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "Quiz not found"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Unauthorized access"})
    async getQuiz(@Req() req: any){
        return await this.quizService.getQuizInformations(req.quiz.code);
    }

    @Post("create")
    @ApiResponse({status: HttpStatus.OK, description: "Quiz created successfully", type: CreateQuizResponse})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid request data"})
    async createQuiz(@Body() createQuizDto: CreateQuizDto){
        return await this.quizService.createQuiz(createQuizDto.questionCount, createQuizDto.categoryId, createQuizDto.difficultyId);
    }

    @Get("categories")
    @ApiResponse({status: HttpStatus.OK, description: "Categories retrieved successfully", type: CategoryEntity, isArray: true})
    async getCategories(): Promise<CategoryEntity[]>{
        return await this.quizService.getCategories();
    }

    @Get("difficulties")
    @ApiResponse({status: HttpStatus.OK, description: "Difficulties retrieved successfully", type: CategoryEntity, isArray: true})
    getDifficulties(){
        return this.quizService.getDifficulties();
    }
}
