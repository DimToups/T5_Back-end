import {PartialQuestionEntity} from "./partial-question.entity";
import {PartialAnswerEntity} from "./partial-answer.entity";

export class QuestionEntity extends PartialQuestionEntity{
    sum: string;
    userId?: string;

    answers: PartialAnswerEntity[];

    constructor(partial: Partial<QuestionEntity>){
        super();
        Object.assign(this, partial);
    }
}
