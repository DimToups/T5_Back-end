import {BadRequestException, Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {AnswerType, Categories, Difficulties, PrismaClient} from "@prisma/client";
import {QuestionEntity} from "./models/entities/question.entity";
import {CipherService} from "../../common/services/cipher.service";
import * as he from "he";
import {PartialQuestionEntity} from "./models/entities/partial-question.entity";
import {UserEntity} from "../users/models/entities/user.entity";
import {PaginationResponse} from "../../common/models/responses/pagination.response";
import {AnswerEntity} from "./models/entities/answer.entity";
import {ConfigService} from "@nestjs/config";
import {GenerateAnswersResponse} from "./models/responses/generate-answers.response";

@Injectable()
export class QuestionsService{
    private static readonly BASE_URL = "https://opentdb.com";
    private readonly logger: Logger = new Logger(QuestionsService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly configService: ConfigService,
    ){}

    private generateQuestionSum(question: PartialQuestionEntity, user?: UserEntity): string{
        const infos: string[] = [
            question.question,
            user?.id || "",
            question.difficulty || "",
            question.category || "",
            ...question.answers.map(
                (answer: AnswerEntity) => answer.answerContent,
            )];
        infos.sort();
        return this.cipherService.getSum(infos.join(""));
    }

    async generateQuestions(amount: number, difficulty?: Difficulties, category?: Categories): Promise<QuestionEntity[]>{
        const categoryId: number = category ? Object.keys(Categories).indexOf(Categories[category]) + 9 : undefined; // Offset
        const questions = await this.fetchQuestions(amount, categoryId, difficulty);
        if(!questions || questions.length === 0)
            throw new BadRequestException("No questions found for selected criteria");
        const formattedQuestions: PartialQuestionEntity[] = questions.map((question: any): PartialQuestionEntity => {
            const answers: AnswerEntity[] = question.incorrect_answers.map((answer: string): AnswerEntity => {
                return new AnswerEntity({
                    id: this.cipherService.generateUuid(7),
                    correct: false,
                    type: AnswerType.TEXT,
                    answerContent: he.decode(answer),
                });
            });
            answers.push(new AnswerEntity({
                id: this.cipherService.generateUuid(7),
                correct: true,
                type: AnswerType.TEXT,
                answerContent: he.decode(question.correct_answer),
            }));
            const returnQuestion = {
                question: he.decode(question.question),
                difficulty: Difficulties[he.decode(question.difficulty).toUpperCase()],
                category: Categories[he.decode(question.category).toUpperCase().replaceAll(" ", "_").replaceAll(":", "").replaceAll("&", "AND")],
                answers: answers,
            };
            returnQuestion.answers.forEach((value) => {
                value.questionSum = this.generateQuestionSum(returnQuestion);
            });
            return returnQuestion;
        });
        return formattedQuestions.map((question) => {
            const answers: AnswerEntity[] = question.answers.map((answer: AnswerEntity): AnswerEntity => {
                return new AnswerEntity({
                    id: answer.id,
                    questionSum: answer.questionSum,
                    correct: answer.correct,
                    type: answer.type,
                    answerContent: answer.answerContent,
                });
            });
            return new QuestionEntity({
                sum: this.generateQuestionSum(question),
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: answers,
            });
        });
    }

    private async fetchQuestions(questionCount: number, categoryId?: number, difficulty?: string){
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
        }catch(e){
            throw new InternalServerErrorException(e);
        }
    }

    async getQuestions(
        user?: UserEntity,
        search?: string,
        difficulty?: Difficulties,
        category?: Categories,
        take?: number,
        skip?: number,
    ): Promise<PaginationResponse<QuestionEntity[]>>{
        const questions = await this.prismaService.questions.findMany({
            where: {
                OR: [
                    {user_id: null},
                    user ? {user_id: user.id} : undefined,
                ].filter(Boolean),
                question: {
                    contains: search || "",
                },
                difficulty: difficulty || undefined,
                category: category || undefined,
            },
            take: take || 50,
            skip: skip || 0,
            include: {
                answers: true,
            },
        });
        return {
            data: questions.map((question): QuestionEntity => {
                return new QuestionEntity({
                    sum: question.sum,
                    question: question.question,
                    difficulty: question.difficulty,
                    category: question.category,
                    answers: question.answers.map(answer => new AnswerEntity({
                        id: answer.id,
                        questionSum: answer.question_sum,
                        correct: answer.correct,
                        type: answer.type,
                        answerContent: answer.answer_content,
                    })),
                    userId: question.user_id,
                });
            }),
            total: await this.prismaService.questions.count({
                where: {
                    OR: [
                        {user_id: null},
                        user ? {user_id: user.id} : undefined,
                    ].filter(Boolean),
                    question: {
                        contains: search || "",
                    },
                    difficulty: difficulty || undefined,
                    category: category || undefined,
                },
            }),
            take: take || 50,
            skip: skip || 0,
        };
    }

    async addPartialQuestionsToDatabase(partialQuestions: PartialQuestionEntity[], user?: UserEntity, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<QuestionEntity[]>{
        const prisma = tx || this.prismaService;
        const questions: QuestionEntity[] = partialQuestions.map((question: PartialQuestionEntity): QuestionEntity => {
            return new QuestionEntity({
                sum: this.generateQuestionSum(question, user),
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: question.answers.map(answer => new AnswerEntity({
                    id: this.cipherService.generateUuid(7),
                    questionSum: this.generateQuestionSum(question, user),
                    correct: answer.correct,
                    type: answer.type,
                    answerContent: answer.type === "TEXT" ? answer.answerContent : null,
                })),
                userId: user?.id,
            });
        });
        await prisma.questions.createMany({
            data: questions.map((question: QuestionEntity) => {
                return {
                    sum: question.sum,
                    question: question.question,
                    difficulty: question.difficulty,
                    category: question.category,
                    user_id: question.userId,
                };
            }),
            skipDuplicates: true,
        });

        await prisma.answers.deleteMany({
            where: {
                question_sum: {
                    in: questions.map(question => question.sum),
                },
            },
        });

        const data: any[] = [];
        for(const question of questions){
            data.push(...question.answers.map(answer => ({
                question_sum: question.sum,
                correct: answer.correct,
                type: answer.type,
                id: this.cipherService.generateUuid(7),
                answer_content: answer.answerContent,
                created_at: new Date(),
            })));
        }

        await prisma.answers.createMany({
            data: data,
        });

        return questions;
    }

    async generateAnswers(question: string): Promise<GenerateAnswersResponse>{
        const apiUrl = this.configService.get<string>("AI_API_URL");
        const apiKey = this.configService.get<string>("AI_API_KEY");
        const prompt = `Génère des réponses pour la question suivante : "${question}".
Ces réponses seront donné au format Json suivant : {"correctAnswer": "Réponse correcte", "incorrectAnswers": ["Réponse incorrecte 1", "Réponse incorrecte 2", "Réponse incorrecte 3"]}.
Répond avec uniquement le Json et dans la langue de la question posée.`;
        const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `token=${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.2-3b-instruct:q4_k_m",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                        image: "",
                    },
                ],
                stream: false,
                max_tokens: 100,
            }),
        });
        const data = await response.json();
        if(data.error)
            throw new BadRequestException(data.error);
        try{
            return JSON.parse(data.choices[0].message.content);
        }catch(_){
            this.logger.debug(data.choices[0].message.content);
            throw new BadRequestException("Could not parse answer");
        }
    }
}
