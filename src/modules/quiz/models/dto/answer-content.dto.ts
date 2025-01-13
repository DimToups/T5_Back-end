import {IsString} from "class-validator";
import {Optional} from "@nestjs/common";

export class AnswerContentDto{
    @IsString()
    answerContent: string;

    @Optional()
    @IsString()
    type: string;
}
