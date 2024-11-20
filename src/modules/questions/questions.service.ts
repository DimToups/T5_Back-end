import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Categories, Difficulties, Questions} from "@prisma/client";
import {QuestionEntity} from "./models/entities/question.entity";
import {CipherService} from "../../common/services/cipher.service";
import * as he from "he";

@Injectable()
export class QuestionsService{

    private static readonly BASE_URL = "https://opentdb.com";

    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    private generateQuestionSum(question: QuestionEntity): string{
        const infos: string[] = [question.question, question.correctAnswer, ...question.incorrectAnswers];
        infos.sort();
        return this.cipherService.getSum(infos.join(""));
    }

    async generateQuestions(amount: number, difficulty?: Difficulties, category?: Categories): Promise<QuestionEntity[]>{
        const categoryId: number = category ? Object.keys(Categories).indexOf(Categories[category]) + 9 : undefined; // Offset
        const questions: any[] = await this.fetchQuestions(amount, categoryId, difficulty);
        const formattedQuestions: QuestionEntity[] = questions.map(question => {
            console.log(he.decode(question.category).toUpperCase().replaceAll(" ", "_").replaceAll(":", "").replaceAll("&", "AND"));
            return {
                sum: "",
                question: he.decode(question.question),
                difficulty: Difficulties[he.decode(question.difficulty).toUpperCase()],
                category: Categories[he.decode(question.category).toUpperCase().replaceAll(" ", "_").replaceAll(":", "").replaceAll("&", "AND")],
                correctAnswer: he.decode(question.correct_answer),
                incorrectAnswers: question.incorrect_answers.map((answer: string) => he.decode(answer)),
            };
        });
        return formattedQuestions.map(question => {
            question.sum = this.generateQuestionSum(question);
            return question;
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

    async getQuestions(amount: number, difficulty?: Difficulties, category?: Categories): Promise<QuestionEntity[]>{
        const whereClause: any = {};
        if(difficulty)
            whereClause.difficulty = difficulty;
        if(category)
            whereClause.category = category;
        const questions: Questions[] = await this.prismaService.questions.findMany({
            where: whereClause,
        });
        questions.sort(() => 0.5 - Math.random());
        questions.length = questions.length > amount ? amount : questions.length;
        return questions.map((question: Questions) => {
            return {
                sum: question.sum,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                correctAnswer: question.correct_answer,
                incorrectAnswers: question.incorrect_answers,
            };
        });
    }
}
