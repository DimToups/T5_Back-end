import {Injectable, NotFoundException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {Games} from "@prisma/client";
import {CipherService} from "../../common/services/cipher.service";

@Injectable()
export class GamesService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    private generateQuizCode(): string{
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async startGame(quizId: string, user?: UserEntity){
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
        const game: Games = await this.prismaService.games.create({
            data: {
                id: this.cipherService.generateUuid(7),
                quiz_id: quizId,
                user_id: user?.id,
                code: this.generateQuizCode(),
            }
        });
    }
}
