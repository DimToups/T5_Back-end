import {Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {CategoryEntity} from "./models/entities/category.entity";
import {DifficultyEntity} from "./models/entities/difficulty.entity";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import * as he from "he";

@Injectable()
export class QuizService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    private generateQuizCode(): string{
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    private findCategoryFromName(name: string, categories: CategoryEntity[]): CategoryEntity{
        return categories.find(category => category.name.toLowerCase() === he.decode(name).toLowerCase());
    }

    private findDifficultyFromName(name: string, difficulties: DifficultyEntity[]): DifficultyEntity{
        return difficulties.find(difficulty => difficulty.name.toLowerCase() === name.toLowerCase());
    }

    async createQuiz(questionCount: number, categoryId?: number, difficultyId?: number){
        const questions = await this.getQuestions(questionCount, categoryId, difficultyId);
        const code = this.generateQuizCode();
        const categories = await this.getCategories();
        const difficulties = this.getDifficulties();
        const dbQuestions = await Promise.all(questions.map(async(question: any) => {
            return {
                id: this.cipherService.getSum(question.question),
                question: he.decode(question.question),
                correct_answer: he.decode(question.correct_answer),
                incorrect_answers: question.incorrect_answers.map((answer: string) => he.decode(answer)),
                category: this.findCategoryFromName(question.category, categories).id,
                difficulty: this.findDifficultyFromName(question.difficulty, difficulties).id,
            };
        }));
        await this.prismaService.questions.createMany({
            data: dbQuestions,
            skipDuplicates: true
        });
        await this.prismaService.quiz.create({
            data: {
                code,
                category: categoryId,
                difficulty: difficultyId,
            }
        });
        const quizQuestions = dbQuestions.map((question: any) => {
            return {
                quiz_code: code,
                question_id: question.id,
            };
        });
        await this.prismaService.quizQuestions.createMany({
            data: quizQuestions
        });
    }

    private async getQuestions(questionCount: number, categoryId?: number, difficultyId?: number){
        let categoryOption = "";
        if(categoryId)
            categoryOption = `&category=${categoryId}`;
        let difficultyOption = "";
        if(difficultyId){
            const difficultyName = this.getDifficulties().find(difficulty => difficulty.id === difficultyId).name;
            if(!difficultyName)
                throw new NotFoundException("Difficulty not found");
            difficultyOption = `&difficulty=${difficultyName.toLowerCase()}`;
        }
        try{
            const res = await fetch(`https://opentdb.com/api.php?amount=${questionCount}${categoryOption}${difficultyOption}`);
            const data = await res.json();
            return data.results;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }

    async getCategories(): Promise<CategoryEntity[]>{
        try{
            const res = await fetch("https://opentdb.com/api_category.php");
            const data = await res.json();
            return data.trivia_categories;
        }catch (e){
            throw new InternalServerErrorException(e);
        }

    }

    getDifficulties(): DifficultyEntity[]{
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
}
