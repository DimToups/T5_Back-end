import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";
import {JwtService} from "./jwt.service";
import {Module} from "@nestjs/common";

@Module({
    providers: [
        CipherService,
        JwtService,
        PrismaService,
    ],
    exports: [
        CipherService,
        JwtService,
        PrismaService,
    ],
})
export class ServicesModule{}
