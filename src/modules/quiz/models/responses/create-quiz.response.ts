import {ApiProperty} from "@nestjs/swagger";
import {QuestionEntity} from "../../../questions/models/entities/question.entity";
import {QuizEntity} from "../entities/quiz.entity";

export class CreateQuizResponse{
    @ApiProperty()
        quiz: QuizEntity;
    @ApiProperty()
        firstQuestion: QuestionEntity;
}
