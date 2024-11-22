import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, Length} from "class-validator";

export class CreateQuizDto{
    @IsString()
    @Length(3, 50)
    title: string;

    @IsString()
    @IsOptional()
    @Length(0, 140)
    description?: string;

    @ApiProperty({enum: Difficulties})
    @IsString()
    @IsOptional()
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories})
    @IsString()
    @IsOptional()
    category?: Categories;
}
