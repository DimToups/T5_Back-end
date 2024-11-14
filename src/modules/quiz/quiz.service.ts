import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {CategoryEntity} from "./models/entities/category.entity";
import {DifficultyEntity} from "./models/entities/difficulty.entity";
import {PrismaService} from "../../common/services/prisma.service";
import {CipherService} from "../../common/services/cipher.service";
import * as he from "he";
import {QuestionsService} from "../questions/questions.service";
import {CreateQuizResponse} from "./models/responses/create-quiz.response";
import {QuizEntity} from "./models/entities/quiz.entity";

@Injectable()
export class QuizService{

    private static readonly BASE_URL = "https://opentdb.com";

    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly questionsService: QuestionsService,
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

    async createQuiz(questionCount: number, categoryId?: number, difficultyId?: number): Promise<CreateQuizResponse>{
        const questions: any[] = await this.getQuestions(questionCount, categoryId, difficultyId);
        if(!questions || questions.length === 0)
            throw new BadRequestException("No questions found for this settings");
        let code = this.generateQuizCode();
        while(await this.prismaService.quiz.findUnique({where: {code}}))
            code = this.generateQuizCode();
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
        const quiz = await this.prismaService.quiz.create({
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
        return {
            quiz: {
                code,
                category: categoryId,
                difficulty: difficultyId,
                question_count: quizQuestions.length,
                score: quiz.score,
            },
            firstQuestion: await this.questionsService.getCurrentQuestion(quiz.code),
        };
    }

    private async getQuestions(questionCount: number, categoryId?: number, difficultyId?: number): Promise<any[]>{
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
            const res = await fetch(`${QuizService.BASE_URL}/api.php?amount=${questionCount}${categoryOption}${difficultyOption}`);
            const data = await res.json();
            return data.results;
        }catch (e){
            throw new InternalServerErrorException(e);
        }
    }

    async getCategories(): Promise<CategoryEntity[]>{
        try{
            const res = await fetch(`${QuizService.BASE_URL}/api_category.php`);
            const data = await res.json();
            return data.trivia_categories;
        }catch (e){
            throw new InternalServerErrorException(e);
        }

    }

    async getQuizInformations(quizCode: string): Promise<QuizEntity>{
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                code: quizCode
            },
            include: {
                quiz_questions: true
            }
        });
        if(!quiz)
            throw new NotFoundException("Quiz not found");
        return {
            code: quiz.code,
            category: quiz.category,
            difficulty: quiz.difficulty,
            question_count: quiz.quiz_questions.length,
            score: quiz.score,
        };
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

    async resetQuiz(code: string): Promise<CreateQuizResponse>{
        await this.prismaService.quiz.update({
            where: {
                code
            },
            data: {
                current_question: 0,
                score: 0
            }
        });
        return {
            quiz: await this.getQuizInformations(code),
            firstQuestion: await this.questionsService.getCurrentQuestion(code)
        };
    }
}
