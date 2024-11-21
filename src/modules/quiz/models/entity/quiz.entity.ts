import {QuestionEntity} from "../../../questions/models/entities/question.entity";
import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";

export class QuizEntity{
    id: string;
    title: string;
    description?: string;
    @ApiProperty({enum: Difficulties})
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories})
    category?: Categories;

    questions: QuestionEntity[];
    userId?: string;

    constructor(partial: Partial<QuizEntity>){
        Object.assign(this, partial);
    }
}
