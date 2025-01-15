import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {File} from "@nest-lab/fastify-multer";
import * as sharp from "sharp";
import * as fs from "node:fs";
import {Readable} from "node:stream";
import * as ffmpeg from "fluent-ffmpeg";
import {join} from "node:path";

@Injectable()
export class FileService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async uploadFile(answerId: string, file: File, user: UserEntity): Promise<string>{
        if(!(await this.checkFile(answerId, file, user)))
            throw new BadRequestException("File type not supported");

        const answer = await this.prismaService.answers.findUnique({
            where: {
                id: answerId,
            },
        });
        if(!answer)
            throw new NotFoundException("Answer not found");
        const question = await this.prismaService.questions.findUnique({
            where: {
                sum: answer.question_sum,
            },
            include: {
                quiz_questions: {
                    include: {
                        quiz: true,
                    },
                },
            },
        });

        if(!question.user_id || user.id !== question.user_id)
            throw new ForbiddenException("You're not allowed to upload a file for this answer.");

        if(file.mimetype.split("/")[0] === "image"){
            const image = await this.convertImage(await this.resizeImage(file.buffer, 1024, 1024));
            return this.saveFile(answerId, image, "webp");
        }
        if(file.mimetype.split("/")[0] === "audio"){
            const audio = await this.convertAudio(file.buffer);
            return this.saveFile(answerId, audio, "mp3");
        }
        throw new BadRequestException("File type not supported");
    }

    private async checkFile(answerId: string, file: File, user: UserEntity): Promise<boolean>{
        if(!file.buffer)
            throw new BadRequestException("No file uploaded");
        if(!user)
            throw new UnauthorizedException("You must be connected to upload a file.");

        if(file.mimetype.split("/")[0] === "image")
            return true;
        if(file.mimetype.split("/")[0] === "audio")
            return true;
        throw new BadRequestException("File type not supported");
    }

    private async saveFileWithoutDb(answerId: string, file: Buffer, extension: string): Promise<string>{
        const sum = this.cipherService.getSum(file.toString());
        const answer = await this.prismaService.answers.findUnique({
            where: {
                id: answerId,
            },
        });
        const path = join(process.cwd(), "public_answers", sum + "." + extension);
        if(answer?.answer_content === path){
            return path;
        }
        if(!fs.existsSync(path)){
            console.log(path);
            let parentPath = path.substring(0, path.lastIndexOf("/"));
            if(parentPath === "")
                parentPath = path.substring(0, path.lastIndexOf("\\"));
            console.log(parentPath);
            fs.mkdirSync(parentPath, {recursive: true});
        }
        fs.writeFileSync(path, file);
        return path.split("/").pop();
    }

    private async saveFile(answerId: string, file: Buffer, extension: string): Promise<string>{
        const path = await this.saveFileWithoutDb(answerId, file, extension);
        await this.prismaService.answers.update({
            where: {
                id: answerId,
            },
            data: {
                answer_content: path,
            },
        });
        return path.split("/").pop();
    }

    private async convertImage(image: Buffer){
        // check if image is already in webp format
        return await sharp(image).webp({
            preset: "picture",
            effort: 4,
            smartSubsample: false,
            quality: 80,
            nearLossless: false,
            lossless: false,
            alphaQuality: 100,
        }).toBuffer();
    }

    private async convertAudio(audio: Buffer){
        return new Promise<Buffer>((resolve, reject) => {
            const inputStream = Readable.from(audio);
            let outputBuffer = Buffer.alloc(0);

            ffmpeg(inputStream)
                .audioCodec("libmp3lame")
                .audioBitrate("64k")
                .audioChannels(2)
                .audioFrequency(48000)
                .format("mp3")
                .on("end", () => resolve(outputBuffer))
                .on("error", err => reject(err))
                .pipe()
                .on("data", chunk => outputBuffer = Buffer.concat([outputBuffer, chunk]));
        });
    }

    private async resizeImage(image: Buffer, width: number, height: number): Promise<Buffer>{
        return await sharp(image).resize(width, height, {fit: "contain"}).toBuffer();
    }
}
