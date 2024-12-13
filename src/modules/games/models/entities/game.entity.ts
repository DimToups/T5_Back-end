import {GameModes} from "@prisma/client";

export class GameEntity{
    id: string;
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
