import {AnswerType} from "@prisma/client";
import {IsBoolean, IsEnum, IsObject, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {AnswerContentDto} from "./answer-content.dto";
import {Type} from "class-transformer";

export class CreateAnswerDto{
    @ApiProperty({enum: AnswerType})
    @IsEnum(AnswerType)
    type: AnswerType;

    @IsBoolean()
    correct: boolean;

    @IsObject()
    @ValidateNested()
    @Type(() => AnswerContentDto)
    answerContent: AnswerContentDto;
}
