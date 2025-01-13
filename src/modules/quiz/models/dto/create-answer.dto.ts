import {AnswerType} from "@prisma/client";
import {IsBoolean, IsEnum, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {AnswerContentDto} from "./answer-content.dto";

export class CreateAnswerDto{
    @ApiProperty({enum: AnswerType})
    @IsEnum(AnswerType)
    type: AnswerType;

    @IsBoolean()
    correct: boolean;

    @ValidateNested()
    answerContent: AnswerContentDto | string;
}
