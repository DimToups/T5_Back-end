import {GameModes} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class GameEntity{
    id: string;
    @ApiProperty({enum: GameModes})
    mode: GameModes;

    quizId: string;
    quizTitle: string;
    userId?: string;
    questionCount: number;
    currentQuestion: number;
    score: number;
    code: string;
    createdAt: Date;
    updatedAt: Date;
    endedAt?: Date;
}
