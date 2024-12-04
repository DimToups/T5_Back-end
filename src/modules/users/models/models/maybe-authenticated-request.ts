import {FastifyRequest} from "fastify";
import {UserEntity} from "../entities/user.entity";

export interface MaybeAuthenticatedRequest extends FastifyRequest{
    user?: UserEntity;
    sessionId?: string;
}
