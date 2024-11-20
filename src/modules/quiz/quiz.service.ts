import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Categories, Difficulties, Quiz, QuizQuestions} from "@prisma/client";
import {QuizEntity} from "./models/entity/quiz.entity";
import {CipherService} from "../../common/services/cipher.service";
import {QuestionEntity} from "../questions/models/entities/question.entity";
import {PartialQuestionEntity} from "../questions/models/entities/partial-question.entity";
import {QuestionsService} from "../questions/questions.service";
import {UserEntity} from "../users/models/entities/user.entity";

@Injectable()
export class QuizService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly questionsService: QuestionsService,
    ){}

    async createQuiz(title: string, description?: string, difficulty?: Difficulties, category?: Categories, user?: UserEntity): Promise<QuizEntity>{
        const quizId = this.cipherService.generateUuid(7);
        await this.prismaService.quiz.create({
            data: {
                id: quizId,
                title,
                description,
                difficulty,
                category,
                user_id: user?.id,
            }
        });
        return new QuizEntity({
            id: quizId,
            title,
            description,
            difficulty,
            category,
            userId: user?.id,
            questions: [],
        });
    }

    async getQuizById(quizId: string): Promise<QuizEntity>{
        const quiz: any = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: {
                    include: {
                        question: true,
                    }
                }
            }
        });
        return new QuizEntity({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || undefined,
            difficulty: quiz.difficulty || undefined,
            category: quiz.category || undefined,
            userId: quiz.user_id || undefined,
            questions: quiz.quiz_questions.map((quizQuestion: any): QuestionEntity => {
                const question = quizQuestion.question;
                return {
                    sum: question.sum,
                    question: question.question,
                    difficulty: question.difficulty,
                    category: question.category,
                    correctAnswer: question.correct_answer,
                    incorrectAnswers: question.incorrect_answers,
                    userId: question.user_id,
                } as QuestionEntity;
            }),
        });
    }

    async updateQuiz(
        quizId: string,
        title: string,
        partialQuestions: PartialQuestionEntity[],
        user: UserEntity,
        description?: string,
        difficulty?: Difficulties,
        category?: Categories
    ): Promise<QuizEntity>{
        let quiz: Quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
        });
        if(!user && quiz.user_id)
            throw new UnauthorizedException("You must be connected to update this quiz.");
        if(user && quiz.user_id !== user.id)
            throw new UnauthorizedException("You must be the owner of the quiz to update it.");

        quiz = await this.prismaService.quiz.update({
            where: {
                id: quizId,
            },
            data: {
                title,
                description,
                difficulty,
                category,
            }
        });
        await this.prismaService.quizQuestions.deleteMany({
            where: {
                quiz_id: quizId,
            }
        });
        const questions: QuestionEntity[] = await this.questionsService.addPartialQuestionsToDatabase(partialQuestions);
        await this.prismaService.quizQuestions.createMany({
            data: questions.map((question: QuestionEntity): QuizQuestions => {
                return {
                    quiz_id: quizId,
                    question_id: question.sum,
                    position: questions.findIndex((q: QuestionEntity): boolean => q.sum === question.sum),
                } as QuizQuestions;
            })
        });
        return new QuizEntity({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || undefined,
            difficulty: quiz.difficulty || undefined,
            category: quiz.category || undefined,
            userId: quiz.user_id || undefined,
            questions,
        });
    }
}
