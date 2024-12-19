import {BadRequestException, ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {File} from "@nest-lab/fastify-multer";
import * as sharp from "sharp";
import * as fs from "node:fs";
import {Readable} from "node:stream";
import * as ffmpeg from "fluent-ffmpeg";

@Injectable()
export class FileService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async uploadFile(answerId: string, file: File, user: UserEntity): Promise<string>{
        if(!file.buffer){
            throw new BadRequestException("No file uploaded");
        }
        if(!user){
            throw new UnauthorizedException("You must be connected to upload a file.");
        }
        const answer = await this.prismaService.answers.findUnique({
            where: {
                id: answerId,
            },
        });
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

        if(file.mimetype.split("/")[0] == "image"){
            const image = await this.convertImage(await this.resizeImage(file.buffer, 1024, 1024));
            return this.saveFile(answerId, image, "webp");
        }
        if(file.mimetype.split("/")[0] == "audio"){
            const audio = await this.convertAudio(file.buffer);
            return this.saveFile(answerId, audio, "opus");
        }
        throw new BadRequestException("File type not supported");
    }

    private async saveFile(answerId: string, file: Buffer, extension: string): Promise<string>{
        const sum = this.cipherService.getSum(file.toString());
        const answer = await this.prismaService.answers.findUnique({
            where: {
                id: answerId,
            },
        });
        if(!answer){
            throw new Error("Answer not found");
        }
        const path = "public_answers/" + sum + "." + extension;
        if(answer.answer_content === path){
            return path;
        }
        if(!fs.existsSync(path)){
            const parentPath = path.substring(0, path.lastIndexOf("/"));
            fs.mkdirSync(parentPath, {recursive: true});
        }
        if(fs.existsSync(answer.answer_content)){
            fs.unlinkSync(answer.answer_content);
        }
        fs.writeFileSync(path, file);
        await this.prismaService.answers.update({
            where: {
                id: answerId,
            },
            data: {
                answer_content: path,
            },
        });
        return path;
    }

    private async convertImage(image: Buffer){
        return await sharp(image).webp({
            preset: "picture",
            effort: 6,
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
                .audioCodec("libopus")
                .audioBitrate("64k")
                .audioChannels(2)
                .audioFrequency(48000)
                .format("opus")
                .on("end", () => resolve(outputBuffer))
                .on("error", err => reject(err))
                .pipe()
                .on("data", chunk => outputBuffer = Buffer.concat([outputBuffer, chunk]));
        });
    }

    private async resizeImage(image: Buffer, width: number, height: number): Promise<Buffer>{
        return await sharp(image).resize(width, height, {fit: "cover"}).toBuffer();
    }
}
