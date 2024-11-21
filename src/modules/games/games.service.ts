import {ForbiddenException, Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {Games, Quiz} from "@prisma/client";
import {CipherService} from "../../common/services/cipher.service";
import {GameEntity} from "./models/entities/game.entity";

@Injectable()
export class GamesService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    private generateQuizCode(): string{
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async getGame(gameId: string, user?: UserEntity): Promise<GameEntity>{
        const game: Games = await this.prismaService.games.findFirst({
            where: {
                id: gameId,
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
            userId: game.user_id,
            currentQuestion: game.current_question,
            score: game.score,
            code: game.code,
            createdAt: game.created_at,
            updatedAt: game.updated_at,
        } as GameEntity;
    }

    async startGame(quizId: string, user?: UserEntity): Promise<GameEntity>{
        const quiz: Quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
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
            },
        });
        return {
            id: game.id,
            quizId: game.quiz_id,
            userId: game.user_id,
            currentQuestion: game.current_question,
            score: game.score,
            code: game.code,
            createdAt: game.created_at,
            updatedAt: game.updated_at,
        } as GameEntity;
    }
}
