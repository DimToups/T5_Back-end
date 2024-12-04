export class GameEntity{
    id: string;
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
