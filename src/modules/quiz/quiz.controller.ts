import {Body, Controller, Get, Post} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import CreateQuizDto from "./models/dto/create-quiz.dto";

@Controller()
@ApiTags("Quiz")
export class QuizController{
    constructor(

    ){}

    @Post("create")
    async createQuiz(@Body() createQuizDto: CreateQuizDto){

    }

    @Get("themes")
    async getThemes(){

    }

    @Get("difficulties")
    getDifficulties(){
        return [
            {
                id: 1,
                name: "Easy"
            },
            {
                id: 2,
                name: "Medium"
            },
            {
                id: 3,
                name: "Hard"
            }
        ];
    }
}
