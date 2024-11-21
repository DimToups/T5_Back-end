import {IsOptional, IsString} from "class-validator";

export class SubmitAnswerDto{
    @IsString()
    @IsOptional()
    answer: string;
}
