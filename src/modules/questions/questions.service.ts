import {Injectable} from "@nestjs/common";
import {QuestionEntity} from "./models/entities/question.entity";
import {PrismaService} from "../../common/services/prisma.service";

@Injectable()
export class QuestionsService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async getCurrentQuestion(quizCode: string): Promise<QuestionEntity>{
        // TODO
        return null;
    }
}
