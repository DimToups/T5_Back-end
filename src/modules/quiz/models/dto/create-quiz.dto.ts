import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, Max, Min} from "class-validator";

export default class CreateQuizDto{
    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(50)
        questionCount: number;
    @ApiProperty()
    @IsNumber()
        categoryId: number;
    @ApiProperty()
    @IsNumber()
        difficultyId: number;
}
