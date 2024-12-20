import {PublicQuestionEntity} from "../../../games/models/entities/public-question.entity";

export class QuestionResponse{
    question: PublicQuestionEntity;
    endAt?: Date;
}
