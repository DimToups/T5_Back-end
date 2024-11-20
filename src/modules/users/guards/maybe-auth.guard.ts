import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {FastifyRequest} from "fastify";
import {UserEntity} from "../models/entities/user.entity";
import {MaybeAuthenticatedRequest} from "../models/models/maybe-authenticated-request";

@Injectable()
export class MaybeAuthGuard implements CanActivate{

    constructor(
        private readonly prismaService: PrismaService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request: MaybeAuthenticatedRequest = context.switchToHttp().getRequest();
        const sessionId = this.extractTokenFromHeader(request);
        if(!sessionId)
            return true;
        const session = await this.prismaService.sessions.findUnique({where: {id: sessionId}});
        if(!session)
            return true;
        if(session.expire_at < new Date()){
            await this.prismaService.sessions.delete({where: {id: sessionId}});
            return true;
        }
        request.user = new UserEntity(await this.prismaService.users.findUnique({where: {id: session.user_id}}));
        request.sessionId = sessionId;
        return true;
    }
}
