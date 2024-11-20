import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, Max, Min} from "class-validator";

export class GenerateQuestionDto{
    @IsNumber()
    @Min(1)
    @Max(50)
        amount: number;
    @ApiProperty({example: "EASY"})
    @IsString()
    @IsOptional()
        difficulty: Difficulties;
    @ApiProperty({example: "GENERAL_KNOWLEDGE"})
    @IsString()
    @IsOptional()
        category: Categories;
}
