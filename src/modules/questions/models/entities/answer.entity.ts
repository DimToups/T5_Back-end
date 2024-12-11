import {AnswerType} from "@prisma/client";

import {ApiProperty} from "@nestjs/swagger";

export class AnswerEntity{
    id: string;

    questionSum?: string;
    correct: boolean;

    @ApiProperty({enum: AnswerType, required: true})
    type: AnswerType;

    answerContent: string;

    constructor(partial: Partial<AnswerEntity>){
        Object.assign(this, partial);
    }
}
