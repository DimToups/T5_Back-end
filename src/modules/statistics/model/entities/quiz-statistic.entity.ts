export class QuizStatisticEntity{
    playCount: number;
    correctAnswerRate: number;
    playsByMonth: number[];
    correctAnswerRateByQuestion: number[];

    score: {
        min: number;
        max: number;
        average: number;
    };
}
