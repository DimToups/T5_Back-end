import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
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
import {PaginationResponse} from "../../common/models/responses/pagination.response";
import {UserQuizEntity} from "./models/entity/user-quiz.entity";
import {AnswerEntity} from "../questions/models/entities/answer.entity";
import {UpdateQuestionDto} from "./models/dto/update-question.dto";

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
            },
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

    async createQuickQuiz(questionAmount: number, difficulty?: Difficulties, category?: Categories, user?: UserEntity): Promise<QuizEntity>{
        const questions: QuestionEntity[] = await this.questionsService.generateQuestions(questionAmount, difficulty, category);
        const quizId = this.cipherService.generateUuid(7);
        const quiz: Quiz = await this.prismaService.quiz.create({
            data: {
                id: quizId,
                title: `Quick game ${quizId}`,
                description: "Auto-generated quiz for quick game",
                difficulty,
                category,
                user_id: user?.id,
                quick_game: true,
            },
        });
        const finalQuiz: QuizEntity = await this.updateQuiz(quiz.id, quiz.title, questions, user, quiz.description, quiz.difficulty, quiz.category);
        await this.publishQuiz(quiz.id, user);
        return new QuizEntity(finalQuiz);
    }

    async getQuizDataById(quizId: string, user?: UserEntity): Promise<QuizEntity>{
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: {
                    include: {
                        question: {
                            include: {
                                answers: true,
                            },
                        },
                    },
                },
            },
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
            questions: quiz.quiz_questions.map((quizQuestion): QuestionEntity => {
                const question = quizQuestion.question;
                return {
                    sum: question.sum,
                    question: question.question,
                    difficulty: question.difficulty,
                    category: question.category,
                    answers: question.answers.map(answer => new AnswerEntity({
                        id: answer.id,
                        questionSum: answer.question_sum,
                        correct: answer.correct,
                        type: answer.type,
                        answerContent: answer.answer_content,
                    })),
                    userId: question.user_id,
                } as QuestionEntity;
            }),
        });
    }

    async updateQuestion(quizId: string, questionId: string, user: UserEntity, updateQuestion: UpdateQuestionDto): Promise<QuestionEntity>{
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: {
                    include: {
                        question: {
                            include: {
                                answers: true,
                            },
                        },
                    },
                },
            },
        });

        if(!quiz){
            throw new NotFoundException("This quiz doesn't exist.");
        }
        if(!user && quiz.user_id){
            throw new UnauthorizedException("You're not allowed to access this quiz.");
        }
        if(user && quiz.user_id !== user.id){
            throw new ForbiddenException("You're not allowed to access this quiz.");
        }

        const question = quiz.quiz_questions.find(question => question.question_id === questionId).question;
        if(!question){
            throw new NotFoundException("This question doesn't exist.");
        }

        const questionEntity = new QuestionEntity({
            sum: question.sum,
            question: question.question,
            difficulty: question.difficulty,
            category: question.category,
            answers: question.answers.map(answer => new AnswerEntity({
                id: answer.id,
                questionSum: answer.question_sum,
                correct: answer.correct,
                type: answer.type,
                answerContent: answer.answer_content,
            })),
            userId: question.user_id,
        });
        if(this.isEqual(updateQuestion, questionEntity)){
            return questionEntity;
        }

        // handle file upload

        const updatedQuestion = await this.prismaService.questions.update({
            where: {
                sum: question.sum,
            },
            data: {
                question: updateQuestion.question,
                difficulty: updateQuestion.difficulty,
                category: updateQuestion.category,
                answers: {
                    create: updateQuestion.answers.map(answer => ({
                        type: answer.type,
                        correct: answer.correct,
                        answer_content: answer.answerContent,
                        question_sum: question.sum,
                        id: this.cipherService.generateUuid(7),
                    })),
                    deleteMany: {
                        question_sum: {
                            in: question.answers.map(answer => answer.question_sum),
                        },
                    },
                },
            },
            include: {
                answers: true,
            },
        });
        return new QuestionEntity({
            sum: updatedQuestion.sum,
            question: updatedQuestion.question,
            difficulty: updatedQuestion.difficulty,
            category: updatedQuestion.category,
            answers: updatedQuestion.answers.map(answer => new AnswerEntity({
                id: answer.id,
                questionSum: answer.question_sum,
                correct: answer.correct,
                type: answer.type,
                answerContent: answer.answer_content,
            })),
            userId: updatedQuestion.user_id,
        });
    }

    isEqual(questionDto: UpdateQuestionDto, question: QuestionEntity): boolean{
        if(question.question !== questionDto.question
          || question.difficulty !== questionDto.difficulty
          || question.category !== questionDto.category
          || question.answers.length !== questionDto.answers.length){
            return false;
        }
        for(let i = 0; i < question.answers.length; i++){
            let answer = question.answers[i];
            let answerDto = questionDto.answers[i];
            if(answer.type !== answerDto.type
              || answer.correct !== answerDto.correct
              || answer.answerContent !== answerDto.answerContent){
                return false;
            }
        }

        return true;
    }

    async updateQuiz(
        quizId: string,
        title: string,
        partialQuestions: PartialQuestionEntity[],
        user: UserEntity,
        description?: string,
        difficulty?: Difficulties,
        category?: Categories,
    ){
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

        return this.prismaService.$transaction(async(tx) => {
            quiz = await tx.quiz.update({
                where: {
                    id: quizId,
                },
                data: {
                    title,
                    description,
                    difficulty,
                    category,
                },
            });
            await tx.quizQuestions.deleteMany({
                where: {
                    quiz_id: quizId,
                },
            });
            const questions: QuestionEntity[] = await this.questionsService.addPartialQuestionsToDatabase(partialQuestions, user, tx);
            // Dedupe questions array
            let filteredQuestions: QuestionEntity[] = questions.filter((value: QuestionEntity, index: number, self: QuestionEntity[]): boolean =>
                index === self.findIndex((t: QuestionEntity) => (
                    t.sum === value.sum
                )),
            );
            const quizQuestions: QuizQuestions[] = filteredQuestions.map((question: QuestionEntity): QuizQuestions => {
                return {
                    quiz_id: quizId,
                    question_id: question.sum,
                    position: questions.findIndex((q: QuestionEntity): boolean => q.sum === question.sum),
                } as QuizQuestions;
            });
            await tx.quizQuestions.createMany({
                data: quizQuestions,
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
        });
    }

    async publishQuiz(quizId: string, user?: UserEntity): Promise<void>{
        const quiz: any = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: true,
            },
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
            },
        });
    }

    async getPublicQuiz(quizId: string): Promise<PublicQuizEntity>{
        const quiz: any = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                quiz_questions: true,
            },
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

    async getPublicQuizList(
        search?: string,
        difficulty?: Difficulties,
        category?: Categories,
        take?: number,
        skip?: number,
    ): Promise<PaginationResponse<PublicQuizEntity[]>>{
        const quizzes: any[] = await this.prismaService.quiz.findMany({
            where: {
                published: true,
                quick_game: false,
                title: {
                    contains: search || "",
                },
                difficulty: difficulty || undefined,
                category: category || undefined,
            },
            include: {
                quiz_questions: true,
            },
            take: take || 50,
            skip: skip || 0,
        });
        return {
            data: quizzes.map((quiz: any): PublicQuizEntity => {
                return new PublicQuizEntity({
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description || undefined,
                    difficulty: quiz.difficulty || undefined,
                    category: quiz.category || undefined,
                    questionCount: quiz.quiz_questions.length,
                    userId: quiz.user_id || undefined,
                });
            }),
            total: await this.prismaService.quiz.count({
                where: {
                    published: true,
                    quick_game: false,
                    title: {
                        contains: search || "",
                    },
                    difficulty: difficulty || undefined,
                    category: category || undefined,
                },
            }),
            take: take || 50,
            skip: skip || 0,
        };
    }

    async getQuizzes(user: UserEntity, take?: number, skip?: number): Promise<PaginationResponse<UserQuizEntity[]>>{
        const quizzes: any[] = await this.prismaService.quiz.findMany({
            where: {
                user_id: user.id,
                quick_game: false,
            },
            include: {
                quiz_questions: true,
            },
            take: take || 50,
            skip: skip || 0,
        });
        const data: UserQuizEntity[] = quizzes.map((quiz: any): UserQuizEntity => {
            return {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description || undefined,
                questionCount: quiz.quiz_questions.length,
                published: quiz.published,
                difficulty: quiz.difficulty || undefined,
                category: quiz.category || undefined,
            } as UserQuizEntity;
        });
        return {
            data,
            total: await this.prismaService.quiz.count({
                where: {
                    user_id: user.id,
                    quick_game: false,
                },
            }),
            take: take || 50,
            skip: skip || 0,
        } as PaginationResponse<UserQuizEntity[]>;
    }

    async deleteQuiz(quizId: string, user: UserEntity): Promise<void>{
        const quiz: Quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
        });
        if(!quiz)
            throw new NotFoundException("This quiz doesn't exist.");
        if(quiz.user_id !== user.id)
            throw new ForbiddenException("You must be the owner of the quiz to delete it.");
        await this.prismaService.quiz.delete({
            where: {
                id: quizId,
            },
        });
    }
}
