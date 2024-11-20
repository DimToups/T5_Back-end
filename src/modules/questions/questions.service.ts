import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Categories, Difficulties} from "@prisma/client";
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

    async generateQuestions(amount: number, difficulty?: Difficulties, category?: Categories){
        const categoryId: number = category ? Object.keys(Categories).indexOf(Categories[category]) + 9 : undefined; // Offset
        const questions: any[] = await this.getQuestions(amount, categoryId, difficulty);
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

    private async getQuestions(questionCount: number, categoryId?: number, difficulty?: string): Promise<any[]>{
        let categoryOption = "";
        if(categoryId)
            categoryOption = `&category=${categoryId}`;
        let difficultyOption = "";
        if(difficulty){
            difficultyOption = `&difficulty=${difficulty.toLowerCase()}`;
        }
        try{
            const res = await fetch(`${QuestionsService.BASE_URL}/api.php?amount=${questionCount}${categoryOption}${difficultyOption}`);
            const data = await res.json();
            return data.results;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }


    private getDifficulties(): any[]{
        return [
            {
                id: 1,
                name: "Easy"
            },
            {
                id: 2,
                name: "Medium"
            },
            {
                id: 3,
                name: "Hard"
            }
        ];
    }

    private async getCategories(): Promise<any[]>{
        try{
            const res = await fetch(`${QuestionsService.BASE_URL}/api_category.php`);
            const data = await res.json();
            console.log(data.trivia_categories);
            return data.trivia_categories;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }
}
