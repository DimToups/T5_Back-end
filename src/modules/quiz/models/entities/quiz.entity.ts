import {ApiProperty} from "@nestjs/swagger";

export class QuizEntity{
    @ApiProperty()
        code: string;
    @ApiProperty()
        category: number;
    @ApiProperty()
        difficulty: number;
    @ApiProperty()
        question_count: number;
    @ApiProperty()
        score: number;
}
