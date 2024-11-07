import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, Max, Min} from "class-validator";

export default class CreateQuizDto{
    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(50)
        questionCount: number;
    @ApiProperty()
    @IsNumber()
    @IsOptional()
        categoryId: number;
    @ApiProperty()
    @IsNumber()
    @IsOptional()
        difficultyId: number;
}
