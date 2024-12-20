export class TimeLimitEntity{
    constructor(timeLimit: any){
        this.gameId = timeLimit.game_id;
        this.questionSum = timeLimit.question_sum;
        this.timeLimit = timeLimit.time_limit;
    }

    gameId: string;
    questionSum: string;
    timeLimit: Date;
}
