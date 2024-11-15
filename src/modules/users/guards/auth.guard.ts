import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {FastifyRequest} from "fastify";
import {UserEntity} from "../models/entities/user.entity";

@Injectable()
export class AuthGuard implements CanActivate{

    constructor(
        private readonly prismaService: PrismaService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const sessionId = this.extractTokenFromHeader(request);
        if(!sessionId)
            throw new UnauthorizedException("Session id not found in headers");
        const session = await this.prismaService.sessions.findUnique({where: {id: sessionId}});
        if(!session)
            throw new UnauthorizedException("Session not found");
        if(session.expire_at < new Date()){
            await this.prismaService.sessions.delete({where: {id: sessionId}});
            throw new UnauthorizedException("Session expired");
        }
        request.user = new UserEntity(await this.prismaService.users.findUnique({where: {id: session.user_id}}));
        return true;
    }
}
