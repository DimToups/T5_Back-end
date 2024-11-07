import {Injectable, NotFoundException} from "@nestjs/common";
import {QuestionEntity} from "./models/entities/question.entity";
import {PrismaService} from "../../common/services/prisma.service";
import {SubmitAnswerResponse} from "./models/responses/submit-answer.response";

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

    async submitAnswer(quizCode: string, answer: string): Promise<SubmitAnswerResponse>{
        let quiz: any = await this.prismaService.quiz.findUnique({
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
        if(!quiz)
            throw new NotFoundException("Quiz not found");
        const currentQuestion = await this.getCurrentQuestion(quizCode);
        if(!currentQuestion)
            throw new NotFoundException("Question not found");
        const question = await this.prismaService.questions.findUnique({
            where: {
                id: currentQuestion.id,
            }
        });
        if(question.correct_answer.toLowerCase() === answer.toLowerCase()){
            quiz = await this.prismaService.quiz.update({
                where: {
                    code: quizCode,
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
            quiz = await this.prismaService.quiz.update({
                where: {
                    code: quizCode,
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
            score: quiz.score,
            nextQuestion: await this.getCurrentQuestion(quizCode),
        };
    }
}
