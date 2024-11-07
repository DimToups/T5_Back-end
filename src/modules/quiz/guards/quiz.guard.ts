import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {FastifyRequest} from "fastify";

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
        const quiz = await this.prismaService.quiz.findUnique({where: {code}});
        if(!quiz)
            throw new UnauthorizedException("Invalid quiz code provided.");
        request.quiz = quiz;
        return true;
    }
}
