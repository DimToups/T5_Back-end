import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {Categories, Difficulties, GameModes, Games} from "@prisma/client";
import {CipherService} from "../../common/services/cipher.service";
import {GameEntity} from "./models/entities/game.entity";
import {PublicQuestionEntity} from "./models/entities/public-question.entity";
import {SubmitAnswerResponse} from "./models/responses/submit-answer.response";
import {QuizService} from "../quiz/quiz.service";
import {QuestionsService} from "../questions/questions.service";
import {QuizEntity} from "../quiz/models/entity/quiz.entity";
import {PaginationResponse} from "../../common/models/responses/pagination.response";

@Injectable()
export class GamesService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly quizService: QuizService,
        private readonly questionsService: QuestionsService,
    ){}

    private generateQuizCode(): string{
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async getGame(gameId: string, user?: UserEntity): Promise<GameEntity>{
        const game: any = await this.prismaService.games.findFirst({
            where: {
                id: gameId,
            },
            include: {
                quiz: {
                    include: {
                        quiz_questions: true,
                    },
                },
            },
        });
        if(!game)
            throw new NotFoundException("This game doesn't exist.");
        if(!user && game.user_id)
            throw new UnauthorizedException("You're not allowed to access this game.");
        if(user && game.user_id && game.user_id !== user.id)
            throw new ForbiddenException("You're not allowed to access this game.");
        return {
            id: game.id,
            quizId: game.quiz_id,
            quizTitle: game.quiz.title,
            userId: game.user_id,
            questionCount: game.quiz.quiz_questions.length,
            currentQuestion: game.current_question,
            score: game.score,
            code: game.code,
            createdAt: game.created_at,
            updatedAt: game.updated_at,
            endedAt: game.ended_at,
        } as GameEntity;
    }

    async getGameByCode(gameCode: string, user?: UserEntity): Promise<GameEntity>{
        const game: any = await this.prismaService.games.findFirst({
            where: {
                code: gameCode,
            },
            include: {
                quiz: {
                    include: {
                        quiz_questions: true,
                    },
                },
            },
        });
        if(!game)
            throw new NotFoundException("This game doesn't exist.");
        if(!user && game.user_id)
            throw new UnauthorizedException("You're not allowed to access this game.");
        if(user && game.user_id && game.user_id !== user.id)
            throw new ForbiddenException("You're not allowed to access this game.");
        return {
            id: game.id,
            quizId: game.quiz_id,
            quizTitle: game.quiz.title,
            userId: game.user_id,
            questionCount: game.quiz.quiz_questions.length,
            currentQuestion: game.current_question,
            score: game.score,
            code: game.code,
            createdAt: game.created_at,
            updatedAt: game.updated_at,
            endedAt: game.ended_at,
        } as GameEntity;
    }

    async startGame(quizId: string, user?: UserEntity, gameMode: GameModes = GameModes.SINGLEPLAYER): Promise<GameEntity>{
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
            throw new UnauthorizedException("This quiz isn't published yet.");
        const game: Games = await this.prismaService.games.create({
            data: {
                id: this.cipherService.generateUuid(7),
                quiz_id: quizId,
                user_id: user?.id,
                code: this.generateQuizCode(),
                mode: gameMode,
            },
        });
        return {
            id: game.id,
            mode: game.mode,
            quizId: game.quiz_id,
            quizTitle: quiz.title,
            userId: game.user_id,
            questionCount: quiz.quiz_questions.length,
            currentQuestion: game.current_question,
            score: game.score,
            code: game.code,
            createdAt: game.created_at,
            updatedAt: game.updated_at,
            endedAt: game.ended_at,
        } as GameEntity;
    }

    async getGames(userId: string, take?: number, skip?: number): Promise<PaginationResponse<GameEntity[]>>{
        const games: any[] = await this.prismaService.games.findMany({
            where: {
                user_id: userId,
            },
            include: {
                quiz: {
                    include: {
                        quiz_questions: true,
                    },
                },
            },
            take: take || 50,
            skip: skip || 0,
        });
        const data: GameEntity[] = games.map((game: any) => {
            return {
                id: game.id,
                quizId: game.quiz_id,
                quizTitle: game.quiz.title,
                userId: game.user_id,
                questionCount: game.quiz.quiz_questions.length,
                currentQuestion: game.current_question,
                score: game.score,
                code: game.code,
                createdAt: game.created_at,
                updatedAt: game.updated_at,
                endedAt: game.ended_at,
            } as GameEntity;
        });
        return {
            data,
            total: await this.prismaService.games.count({
                where: {
                    user_id: userId,
                },
            }),
            take: take || 50,
            skip: skip || 0,
        } as PaginationResponse<GameEntity[]>;
    }

    async getCurrentQuestion(gameId: string, user?: UserEntity): Promise<PublicQuestionEntity>{
        const game: Games = await this.prismaService.games.findUnique({
            where: {
                id: gameId,
            },
        });
        if(!game)
            throw new NotFoundException("Game not found");
        if(!user && game.user_id)
            throw new UnauthorizedException("You're not allowed to access this game.");
        if(user && game.user_id && game.user_id !== user.id)
            throw new ForbiddenException("You're not allowed to access this game.");
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: game.quiz_id,
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
        const questions = quiz.quiz_questions.map(quizQuestion => quizQuestion.question);
        const question = questions[game.current_question];
        if(!question)
            throw new NotFoundException("Question not found");
        const answers = question.answers.map((answer) => {
            return {
                id: answer.id,
                questionSum: answer.question_sum,
                type: answer.type,
                answerContent: answer.answer_content,
            };
        });
        if(question.answers.length === 4){
            answers.sort(() => Math.random() - 0.5);
            return {
                sum: question.sum,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: answers,
                position: game.current_question + 1,
            };
        }else{
            return {
                sum: question.sum,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: answers,
                position: game.current_question + 1,
            };
        }
    }

    async answerQuestion(gameId: string, answer?: string, user?: UserEntity): Promise<SubmitAnswerResponse>{
        // GetCurrentQuestion already check game ownership
        const currentQuestion: PublicQuestionEntity = await this.getCurrentQuestion(gameId, user);
        const question = await this.prismaService.questions.findUnique({
            where: {
                sum: currentQuestion.sum,
            },
            include: {
                answers: true,
            },
        });
        const correctAnswer = question.answers.find(answer => answer.correct);
        const isCorrect: boolean = correctAnswer?.id === answer;
        const game: Games = await this.prismaService.games.update({
            where: {
                id: gameId,
            },
            data: {
                current_question: {
                    increment: 1,
                },
                score: {
                    increment: isCorrect ? 1 : 0,
                },
            },
        });
        if(game.mode === GameModes.MULTIPLAYER || game.mode === GameModes.TEAM_EASY || game.mode === GameModes.TEAM_MEDIUM || game.mode === GameModes.TEAM_HARD)
            throw new BadRequestException("You can't answer questions using this way for this game mode");
        await this.prismaService.statisticsAnswers.create({
            data: {
                game_id: gameId,
                question_sum: question.sum,
                correct: isCorrect,
                empty: !answer,
            },
        });
        let nextQuestion: PublicQuestionEntity | undefined;
        try{
            nextQuestion = await this.getCurrentQuestion(game.id, user);
        }catch(_){
            // Only possible error is question not found (end of quiz)
            await this.prismaService.games.update({
                where: {
                    id: gameId,
                },
                data: {
                    ended_at: new Date(),
                },
            });
        }
        return {
            isCorrect,
            correctAnswer: question.answers.find(answer => answer.correct)?.id,
            score: game.score,
            nextQuestion,
        };
    }

    async isAnswerCorrect(questionSum: string, answer: string): Promise<boolean>{
        const question = await this.prismaService.questions.findUnique({
            where: {
                sum: questionSum,
            },
            include: {
                answers: true,
            },
        });
        return question.answers.find(answer => answer.correct)?.id === answer;
    }

    async getCorrectAnswer(questionSum: string): Promise<string>{
        const question = await this.prismaService.questions.findUnique({
            where: {
                sum: questionSum,
            },
            include: {
                answers: true,
            },
        });
        return question.answers.find(answer => answer.correct)?.id;
    }

    async createQuickGame(amount: number, difficulty?: Difficulties, category?: Categories, user?: UserEntity): Promise<GameEntity>{
        let quiz: QuizEntity = await this.quizService.createQuickQuiz(amount, difficulty, category, user);
        return await this.startGame(quiz.id, user);
    }

    async getQuestionCount(gameId: string): Promise<number>{
        const game = await this.prismaService.games.findUnique({
            where: {
                id: gameId,
            },
            include: {
                quiz: {
                    include: {
                        quiz_questions: true,
                    },
                },
            },
        });
        return game.quiz.quiz_questions.length;
    }

    async nextQuestion(gameId: string): Promise<void>{
        const game = await this.prismaService.games.findUnique({
            where: {
                id: gameId,
            },
        });
        if(game.current_question >= await this.getQuestionCount(gameId)){
            await this.prismaService.games.update({
                where: {
                    id: gameId,
                },
                data: {
                    ended_at: new Date(),
                },
            });
            return;
        }
        await this.prismaService.games.update({
            where: {
                id: gameId,
            },
            data: {
                current_question: {
                    increment: 1,
                },
            },
        });
    }
}
