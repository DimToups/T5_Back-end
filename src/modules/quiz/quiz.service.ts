import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable, NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Categories, Difficulties, Quiz, QuizQuestions} from "@prisma/client";
import {QuizEntity} from "./models/entity/quiz.entity";
import {CipherService} from "../../common/services/cipher.service";
import {QuestionEntity} from "../questions/models/entities/question.entity";
import {PartialQuestionEntity} from "../questions/models/entities/partial-question.entity";
import {QuestionsService} from "../questions/questions.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {PublicQuizEntity} from "./models/entity/public-quiz.entity";

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

    async getQuizDataById(quizId: string, user?: UserEntity): Promise<QuizEntity>{
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
        if(!quiz)
            throw new NotFoundException("This quiz doesn't exist.");
        if(quiz.published)
            throw new BadRequestException("You can't retrieve data about a published quiz.");
        if(!user && quiz.user_id)
            throw new UnauthorizedException("You must be connected to get this quiz.");
        if(user && quiz.user_id !== user.id)
            throw new ForbiddenException("You must be the owner of the quiz to get it.");
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
        if(!quiz)
            throw new NotFoundException("This quiz doesn't exist.");
        if(quiz.published)
            throw new ConflictException("You can't update a quiz that has been published.");
        if(!user && quiz.user_id)
            throw new UnauthorizedException("You must be connected to update this quiz.");
        if(user && quiz.user_id !== user.id)
            throw new ForbiddenException("You must be the owner of the quiz to update it.");

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

    async publishQuiz(quizId: string, user?: UserEntity): Promise<void>{
        const quiz: any = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: true
            }
        });
        if(!quiz)
            throw new NotFoundException("This quiz doesn't exist.");
        if(quiz.published)
            throw new BadRequestException("This quiz has already been published.");
        if(!user && quiz.user_id)
            throw new UnauthorizedException("You must be connected to update this quiz.");
        if(user && quiz.user_id !== user.id)
            throw new ForbiddenException("You must be the owner of the quiz to update it.");
        if(quiz.quiz_questions.length < 1)
            throw new BadRequestException("You must have at least one question in your quiz to publish it.");
        await this.prismaService.quiz.update({
            where: {
                id: quizId,
            },
            data: {
                published: true,
            }
        });
    }

    async getPublicQuiz(quizId: string): Promise<PublicQuizEntity>{
        const quiz: any = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: true
            }
        });
        if(!quiz)
            throw new NotFoundException("This quiz doesn't exist.");
        if(!quiz.published)
            throw new UnauthorizedException("This quiz hasn't been published yet.");
        return new PublicQuizEntity({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || undefined,
            difficulty: quiz.difficulty || undefined,
            category: quiz.category || undefined,
            questionCount: quiz.quiz_questions.length,
            userId: quiz.user_id || undefined,
        });
    }

    async getPublicQuizList(take: number = 50, skip: number = 0): Promise<PublicQuizEntity[]>{
        const quizzes: any[] = await this.prismaService.quiz.findMany({
            where: {
                published: true,
            },
            include: {
                quiz_questions: true
            },
            take,
            skip,
        });
        return quizzes.map((quiz: any): PublicQuizEntity => {
            return new PublicQuizEntity({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description || undefined,
                difficulty: quiz.difficulty || undefined,
                category: quiz.category || undefined,
                questionCount: quiz.quiz_questions.length,
                userId: quiz.user_id || undefined,
            });
        });
    }
}
