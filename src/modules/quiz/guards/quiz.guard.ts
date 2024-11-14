import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {FastifyRequest} from "fastify";
import {QuizEntity} from "../models/entities/quiz.entity";

@Injectable()
export class QuizGuard implements CanActivate{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const code = this.extractTokenFromHeader(request);
        if(!code)
            throw new UnauthorizedException("You must provide a quiz code to access this resource.");
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                code
            },
            include: {
                quiz_questions: true
            }
        });
        if(!quiz)
            throw new UnauthorizedException("Invalid quiz code provided.");
        request.quiz = {
            code: quiz.code,
            category: quiz.category,
            difficulty: quiz.difficulty,
            question_count: quiz.quiz_questions.length,
            score: 0,
        } as QuizEntity;
        return true;
    }
}
