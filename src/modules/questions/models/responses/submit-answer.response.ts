import {QuestionEntity} from "../entities/question.entity";
import {ApiProperty} from "@nestjs/swagger";

export class SubmitAnswerResponse{
    @ApiProperty()
        isCorrect: boolean;
    @ApiProperty()
        correctAnswer: string;
    @ApiProperty()
        score: number;
    @ApiProperty()
        nextQuestion: QuestionEntity;
}
