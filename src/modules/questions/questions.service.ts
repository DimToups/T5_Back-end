import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Categories, Difficulties, Questions} from "@prisma/client";
import {QuestionEntity} from "./models/entities/question.entity";
import {CipherService} from "../../common/services/cipher.service";
import * as he from "he";
import {PartialQuestionEntity} from "./models/entities/partial-question.entity";
import {UserEntity} from "../users/models/entities/user.entity";

@Injectable()
export class QuestionsService{

    private static readonly BASE_URL = "https://opentdb.com";

    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    private generateQuestionSum(question: PartialQuestionEntity): string{
        const infos: string[] = [question.question, question.difficulty || "", question.category || "", question.correctAnswer, ...question.incorrectAnswers];
        infos.sort();
        return this.cipherService.getSum(infos.join(""));
    }

    async generateQuestions(amount: number, difficulty?: Difficulties, category?: Categories): Promise<QuestionEntity[]>{
        const categoryId: number = category ? Object.keys(Categories).indexOf(Categories[category]) + 9 : undefined; // Offset
        const questions: any[] = await this.fetchQuestions(amount, categoryId, difficulty);
        const formattedQuestions: PartialQuestionEntity[] = questions.map(question => {
            return {
                question: he.decode(question.question),
                difficulty: Difficulties[he.decode(question.difficulty).toUpperCase()],
                category: Categories[he.decode(question.category).toUpperCase().replaceAll(" ", "_").replaceAll(":", "").replaceAll("&", "AND")],
                correctAnswer: he.decode(question.correct_answer),
                incorrectAnswers: question.incorrect_answers.map((answer: string) => he.decode(answer)),
            };
        });
        return formattedQuestions.map(question => {
            return new QuestionEntity({
                sum: this.generateQuestionSum(question),
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                correctAnswer: question.correctAnswer,
                incorrectAnswers: question.incorrectAnswers,
            });
        });
    }

    private async fetchQuestions(questionCount: number, categoryId?: number, difficulty?: string): Promise<any[]>{
        let categoryOption: string = "";
        if(categoryId)
            categoryOption = `&category=${categoryId}`;
        let difficultyOption: string = "";
        if(difficulty){
            difficultyOption = `&difficulty=${difficulty.toLowerCase()}`;
        }
        try{
            const res: Response = await fetch(`${QuestionsService.BASE_URL}/api.php?amount=${questionCount}${categoryOption}${difficultyOption}`);
            const data: any = await res.json();
            return data.results;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }

    async getQuestions(
        user?: UserEntity,
        search?: string,
        difficulty?: Difficulties,
        category?: Categories,
        take?: number,
        skip?: number
    ): Promise<QuestionEntity[]>{
        const whereClause: any = {
            OR: [
                {userId: null},
                user ? {userId: user.id} : undefined,
            ].filter(Boolean),
        };
        if(search)
            whereClause.question = {
                contains: search,
            };
        if(difficulty)
            whereClause.difficulty = difficulty;
        if(category)
            whereClause.category = category;
        const questions: Questions[] = await this.prismaService.questions.findMany({
            where: whereClause,
            take: take || 50,
            skip: skip || 0,
        });
        return questions.map((question: Questions): QuestionEntity => {
            return new QuestionEntity({
                sum: question.sum,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                correctAnswer: question.correct_answer,
                incorrectAnswers: question.incorrect_answers,
                userId: question.user_id,
            });
        });
    }

    async addPartialQuestionsToDatabase(partialQuestions: PartialQuestionEntity[]): Promise<QuestionEntity[]>{
        const questions: QuestionEntity[] = partialQuestions.map((question: PartialQuestionEntity): QuestionEntity => {
            return new QuestionEntity({
                sum: this.generateQuestionSum(question),
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                correctAnswer: question.correctAnswer,
                incorrectAnswers: question.incorrectAnswers,
                userId: question.userId,
            });
        });
        await this.prismaService.questions.createMany({
            data: questions.map((question: QuestionEntity): Questions => {
                return {
                    sum: question.sum,
                    question: question.question,
                    difficulty: question.difficulty,
                    category: question.category,
                    correct_answer: question.correctAnswer,
                    incorrect_answers: question.incorrectAnswers,
                    user_id: question.userId,
                };
            }),
            skipDuplicates: true,
        });
        return questions;
    }
}
