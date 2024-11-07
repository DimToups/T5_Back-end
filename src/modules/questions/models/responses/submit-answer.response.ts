import {QuestionEntity} from "../entities/question.entity";

export class SubmitAnswerResponse{
    isCorrect: boolean;
    correctAnswer: string;
    score: number;
    nextQuestion: QuestionEntity;
}
