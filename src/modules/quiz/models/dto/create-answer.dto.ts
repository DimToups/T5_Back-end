import {AnswerType} from "@prisma/client";
import {IsBoolean, IsEnum, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateAnswerDto{
    @ApiProperty({enum: AnswerType})
    @IsEnum(AnswerType)
    type: AnswerType;

    @IsBoolean()
    correct: boolean;

    @IsString()
    @Length(0, 140)
    answerContent: string;
}
