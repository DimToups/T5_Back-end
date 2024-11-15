import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import {UserEntity} from "./models/entities/user.entity";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async createUser(username: string, email: string, password: string): Promise<UserEntity>{
        // Check if username or email already exists
        let user: any = await this.prismaService.users.findFirst({
            where: {
                OR: [
                    {username},
                    {email},
                ],
            },
        });
        if(user)
            throw new ConflictException("Username or email already exists");
        const hashedPassword = await this.cipherService.hashPassword(password);
        user = this.prismaService.users.create({
            data: {
                id: this.cipherService.generateUuid(7),
                username,
                email,
                password: hashedPassword,
            },
        });
        return new UserEntity(user);
    }

    async createSession(username: string, password: string): Promise<string>{
        const user = await this.prismaService.users.findFirst({
            where: {
                username,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        const isValid = await this.cipherService.comparePassword(user.password, password);
        if(!isValid)
            throw new UnauthorizedException("Invalid password");
        const session = await this.prismaService.sessions.create({
            data: {
                id: this.cipherService.generateUuid(7),
                user_id: user.id,
                expire_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            },
        });
        return session.id;
    }

    async getUserFromEmail(email: string): Promise<UserEntity>{
        return new UserEntity(await this.prismaService.users.findFirst({
            where: {
                email,
            },
        }));
    }
}
