import {AnswerType} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class PublicAnswerEntity{
    id: string;

    questionSum: string;

    @ApiProperty({enum: AnswerType, required: true})
    type: AnswerType;

    answerContent: string;
}
