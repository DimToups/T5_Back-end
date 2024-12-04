import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import {Sessions, Users} from "@prisma/client";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async createSession(username: string, password: string): Promise<string>{
        const user: Users = await this.prismaService.users.findFirst({
            where: {
                username,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        const isValid = await this.cipherService.comparePassword(user.password, password);
        if(!isValid)
            throw new UnauthorizedException("Invalid password");
        const session: Sessions = await this.prismaService.sessions.create({
            data: {
                id: this.cipherService.generateUuid(7),
                user_id: user.id,
                expire_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            },
        });
        return session.id;
    }

    async deleteSession(sessionId: string): Promise<void>{
        const session: Sessions = await this.prismaService.sessions.delete({
            where: {
                id: sessionId,
            },
        });
        if(!session)
            throw new NotFoundException("Session not found");
    }

    async cleanupSessions(): Promise<number>{
        const {count} = await this.prismaService.sessions.deleteMany({
            where: {
                expire_at: {
                    lte: new Date(),
                },
            },
        });
        return count;
    }
}
