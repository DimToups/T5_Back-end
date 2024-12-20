import {PublicAnswerEntity} from "./public-answer.entity";

export class PrivateAnswerEntity extends PublicAnswerEntity{
    constructor(answer: any){
        super();
        this.id = answer.id;
        this.questionSum = answer.question_sum;
        this.type = answer.type;
        this.answerContent = answer.answer_content;
        this.correct = answer.correct;
    }

    correct: boolean;
}
