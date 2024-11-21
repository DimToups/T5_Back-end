import {PublicQuestionEntity} from "./entities/public-question.entity";

export class SubmitAnswerResponse{
    isCorrect: boolean;
    correctAnswer: string;
    score: number;
    nextQuestion: PublicQuestionEntity;
}
