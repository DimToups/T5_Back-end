import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class SubmitAnswerDto{
    @ApiProperty()
    @IsString()
    @IsOptional()
        answer: string;
}
