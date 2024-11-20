import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";
import {PartialQuestionEntity} from "../../../questions/models/entities/partial-question.entity";

export class UpdateQuizDto{
    @IsString()
        title: string;
    @IsString()
    @IsOptional()
        description?: string;
    @ApiProperty({enum: Difficulties})
    @IsString()
    @IsOptional()
        difficulty?: Difficulties;
    @ApiProperty({enum: Categories})
    @IsString()
    @IsOptional()
        category?: Categories;
    questions: PartialQuestionEntity[];
}
