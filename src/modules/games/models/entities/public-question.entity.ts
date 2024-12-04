import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";

export class PublicQuestionEntity{
    sum: string;
    question: string;
    @ApiProperty({enum: Difficulties, required: false})
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories, required: false})
    category?: Categories;

    answers: string[];
    position: number;
}
