import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {PartialAnswerEntity} from "./partial-answer.entity";

export class PartialQuestionEntity{
    question: string;
    @ApiProperty({enum: Difficulties, required: false})
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories, required: false})
    category?: Categories;

    answers: PartialAnswerEntity[];
}
