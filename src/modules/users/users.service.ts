import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import {UserEntity} from "./models/entities/user.entity";
import {UserProfileEntity} from "./models/entities/user-profile.entity";
import {Users} from "@prisma/client";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async createUser(username: string, email: string, password: string): Promise<UserEntity>{
        // Check if username or email already exists
        let user: Users = await this.prismaService.users.findFirst({
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
        user = await this.prismaService.users.create({
            data: {
                id: this.cipherService.generateUuid(7),
                username,
                email,
                password: hashedPassword,
            },
        });
        return new UserEntity(user);
    }

    async getUserFromEmail(email: string): Promise<UserEntity>{
        return new UserEntity(await this.prismaService.users.findFirst({
            where: {
                email,
            },
        }));
    }

    async getUserProfile(userId: string): Promise<UserProfileEntity>{
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                id: userId,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        return new UserProfileEntity(user);
    }

    async deleteUser(userId: string): Promise<void>{
        await this.prismaService.users.delete({
            where: {
                id: userId,
            },
        });
    }
}
