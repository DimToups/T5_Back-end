import {Injectable} from "@nestjs/common";
import {QuestionEntity} from "./models/entities/question.entity";
import {PrismaService} from "../../common/services/prisma.service";

@Injectable()
export class QuestionsService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async getCurrentQuestion(quizCode: string): Promise<QuestionEntity>{
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                code: quizCode,
            },
            include: {
                quiz_questions: {
                    include: {
                        question: true,
                    }
                }
            }
        });
        const questions = quiz.quiz_questions.map((quizQuestion: any) => quizQuestion.question);
        const question = questions[quiz.current_question];
        if(question.incorrect_answers.length === 3)
            return{
                id: question.id,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: question.incorrect_answers.concat(question.correct_answer).sort(() => Math.random() - 0.5),
            };
        else
            return{
                id: question.id,
                question: question.question,
                difficulty: question.difficulty,
                category: question.category,
                answers: question.incorrect_answers.concat(question.correct_answer),
            };
    }
}
