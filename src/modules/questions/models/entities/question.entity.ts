import {PartialQuestionEntity} from "./partial-question.entity";

export class QuestionEntity extends PartialQuestionEntity{
    sum: string;

    constructor(partial: Partial<QuestionEntity>){
        super();
        Object.assign(this, partial);
    }
}
