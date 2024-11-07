import {ApiProperty} from "@nestjs/swagger";

export class QuizEntity{
    @ApiProperty()
        code: string;
    @ApiProperty()
        category: number;
    @ApiProperty()
        difficulty: number;
}
