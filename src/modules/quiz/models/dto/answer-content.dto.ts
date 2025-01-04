import {IsString} from "class-validator";

export class AnswerContentDto{
    @IsString()
    answerContent: string;

    @IsString()
    type: string;
}
