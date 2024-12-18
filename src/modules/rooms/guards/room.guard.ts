import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {FastifyRequest} from "fastify";

@Injectable()
export class RoomGuard implements CanActivate{
    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>{
        throw new Error("Method not implemented.");
    }
}
