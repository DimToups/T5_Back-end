import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class PartialQuestionEntity{
    question: string;
    @ApiProperty({example: "EASY"})
        difficulty?: Difficulties;
    @ApiProperty({example: "GENERAL_KNOWLEDGE"})
        category?: Categories;
    correctAnswer: string;
    incorrectAnswers: string[];
    userId?: string;
}
