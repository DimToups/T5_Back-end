import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";
import {AnswerEntity} from "../../../questions/models/entities/answer.entity";

export class PublicQuestionEntity{
    sum: string;
    question: string;
    @ApiProperty({enum: Difficulties, required: false})
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories, required: false})
    category?: Categories;

    answers: AnswerEntity[];
    position: number;
}
