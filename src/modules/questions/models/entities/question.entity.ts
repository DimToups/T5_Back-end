import {PartialQuestionEntity} from "./partial-question.entity";
import {AnswerEntity} from "./answer.entity";

export class QuestionEntity extends PartialQuestionEntity{
    sum: string;
    userId?: string;

    answers: AnswerEntity[];

    constructor(partial: Partial<QuestionEntity>){
        super();
        Object.assign(this, partial);
    }
}
