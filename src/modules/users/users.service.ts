import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}
}
