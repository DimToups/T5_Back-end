import {IsEnum, IsInstance, IsString, Length} from "class-validator";
import {Categories, Difficulties} from "@prisma/client";
import {CreateAnswerDto} from "./create-answer.dto";
import {ApiProperty} from "@nestjs/swagger";

export class CreateQuestionDto{
    @IsString()
    @Length(3, 140)
    question: string;

    @ApiProperty({enum: Difficulties})
    @IsEnum(Difficulties)
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories})
    @IsEnum(Categories)
    category?: Categories;

    @IsInstance(CreateAnswerDto, {each: true})
    answers: CreateAnswerDto[];
}
