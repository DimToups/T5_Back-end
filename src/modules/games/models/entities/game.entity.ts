export class GameEntity{
    id: string;
    quizId: string;
    userId?: string;
    currentQuestion: number;
    score: number;
    code: string;
    createdAt: Date;
    updatedAt: Date;
}
