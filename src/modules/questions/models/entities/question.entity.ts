import {ApiProperty} from "@nestjs/swagger";

export class QuestionEntity{
    @ApiProperty()
        id: string;
    @ApiProperty()
        question: string;
    @ApiProperty()
        difficulty: number;
    @ApiProperty()
        category: number;
    @ApiProperty()
        answers: string[];
    @ApiProperty()
        position: number;
}
