import {Injectable, NotFoundException} from "@nestjs/common";
import {QuestionEntity} from "./models/entities/question.entity";
import {PrismaService} from "../../common/services/prisma.service";
import {SubmitAnswerResponse} from "./models/responses/submit-answer.response";
import {QuizEntity} from "../quiz/models/entities/quiz.entity";

@Injectable()
export class QuestionsService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async getCurrentQuestion(quizCode: string): Promise<QuestionEntity>{
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                code: quizCode,
            },
            include: {
                quiz_questions: {
                    include: {
                        question: true,
                    }
                }
            }
        });
        const questions = quiz.quiz_questions.map((quizQuestion: any) => quizQuestion.question);
        const question = questions[quiz.current_question];
        if(!question)
            return null;
        if(question.incorrect_answers.length === 3)
            return{
                id: question.id,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: question.incorrect_answers.concat(question.correct_answer).sort(() => Math.random() - 0.5),
                position: quiz.current_question + 1,
            };
        else
            return{
                id: question.id,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: question.incorrect_answers.concat(question.correct_answer),
                position: quiz.current_question + 1,
            };
    }

    async submitAnswer(quiz: QuizEntity, answer: string): Promise<SubmitAnswerResponse>{
        const currentQuestion = await this.getCurrentQuestion(quiz.code);
        if(!currentQuestion)
            throw new NotFoundException("Question not found");
        const question = await this.prismaService.questions.findUnique({
            where: {
                id: currentQuestion.id,
            }
        });
        let finalQuiz: any;
        if(question.correct_answer.toLowerCase() === answer.toLowerCase()){
            finalQuiz = await this.prismaService.quiz.update({
                where: {
                    code: quiz.code,
                },
                data: {
                    current_question: {
                        increment: 1,
                    },
                    score: {
                        increment: 1,
                    }
                }
            });
        }else{
            finalQuiz = await this.prismaService.quiz.update({
                where: {
                    code: quiz.code,
                },
                data: {
                    current_question: {
                        increment: 1,
                    }
                }
            });
        }
        return {
            isCorrect: question.correct_answer.toLowerCase() === answer.toLowerCase(),
            correctAnswer: question.correct_answer,
            score: finalQuiz.score,
            nextQuestion: await this.getCurrentQuestion(quiz.code),
        };
    }
}
