import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, Max, Min} from "class-validator";

export class GenerateQuestionDto{
    @IsNumber()
    @Min(1)
    @Max(50)
        amount: number;
    @ApiProperty({enum: Difficulties, required: false})
    @IsString()
    @IsOptional()
        difficulty?: Difficulties;
    @ApiProperty({enum: Categories, required: false})
    @IsString()
    @IsOptional()
        category?: Categories;
}
