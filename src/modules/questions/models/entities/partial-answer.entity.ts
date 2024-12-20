import {AnswerType} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class PartialAnswerEntity{
    questionSum?: string;
    correct: boolean;

    @ApiProperty({enum: AnswerType, required: true})
    type: AnswerType;

    answerContent: string;
}
