import {PartialQuestionEntity} from "../../../questions/models/entities/partial-question.entity";
import {CreateQuizDto} from "./create-quiz.dto";

export class UpdateQuizDto extends CreateQuizDto{
    questions: PartialQuestionEntity[];
}
