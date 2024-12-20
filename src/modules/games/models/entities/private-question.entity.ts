import {PublicQuestionEntity} from "./public-question.entity";
import {PrivateAnswerEntity} from "./private-answer-entity";
import {TimeLimitEntity} from "./time-limit.entity";

export class PrivateQuestionEntity extends PublicQuestionEntity{
    constructor(question: any){
        super();
        this.sum = question.sum;
        this.question = question.question;
        this.difficulty = question.difficulty;
        this.category = question.category;
        this.answers = question.answers.map(answer => new PrivateAnswerEntity(answer));
        this.userId = question.user_id;
        this.timeLimits = question.TimeLimits.map(timeLimit => new TimeLimitEntity(timeLimit));
        this.position = question.position;
    }

    answers: PrivateAnswerEntity[];
    userId: string;
    timeLimits: TimeLimitEntity[];
    position: number;
}
