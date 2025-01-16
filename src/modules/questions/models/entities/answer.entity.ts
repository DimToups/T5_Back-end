import {PartialAnswerEntity} from "./partial-answer.entity";

export class AnswerEntity extends PartialAnswerEntity{
    id: string;

    constructor(partial: Partial<AnswerEntity>){
        super();
        Object.assign(this, partial);
    }
}
