import {FastifyRequest} from "fastify";
import {UserEntity} from "../entities/user.entity";

export interface AuthenticatedRequest extends FastifyRequest{
    user: UserEntity;
}
