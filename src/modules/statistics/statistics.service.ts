import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {QuizStatisticEntity} from "./model/entities/quiz-statistic.entity";
import {Games} from "@prisma/client";

@Injectable()
export class StatisticsService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async getQuizStatistics(quizId: string): Promise<QuizStatisticEntity>{
        const quiz: any = await this.prismaService.quiz.findFirst({
            where: {
                id: quizId,
            },
            include: {
                games: {
                    include: {
                        answers: true,
                    },
                },
                quiz_questions: true,
            },
        });
        return {
            playCount: quiz.games.length,
            score: this.computeScore(quiz.games),
            correctAnswerRate: this.computeCorrectAnswerRate(quiz.games),
            playsByMonth: this.computePlaysByMonth(quiz.games),
            correctAnswerRateByQuestion: this.computeCorrectAnswerRateByQuestion(quiz),
        };
    }

    private computeScore(games: Games[]): any{
        return {
            min: games.reduce((min: number, game: Games): number => Math.min(min, game.score), 0),
            max: games.reduce((max: number, game: Games): number => Math.max(max, game.score), 0),
            average: games.reduce((sum: number, game: Games): number => sum + game.score, 0) / games.length,
        };
    }

    private computeCorrectAnswerRate(games: any[]): number{
        const answers: any[] = games.flatMap((game: any) => game.answers);
        const correctAnswers: any[] = answers.filter((answer: any) => answer.is_correct);
        return correctAnswers.length / answers.length;
    }

    private computePlaysByMonth(games: Games[]): number[]{
        // First element is for January, second for February, etc.
        const plays: number[] = Array(12).fill(0);
        games.forEach((game: Games) => {
            const month: number = new Date(game.created_at).getMonth();
            plays[month] += 1;
        });
        return plays;
    }

    private computeCorrectAnswerRateByQuestion(quiz: any): number[]{
        // First element is for first question, second for second question, etc.
        const goodAnswerRate: number[] = Array(quiz.quiz_questions.length).fill(0);
        quiz.games.forEach((game: any) => {
            game.answers.forEach((answer: any, index: number) => {
                if(answer.is_correct)
                    goodAnswerRate[index] += 1;
            });
        });
        return goodAnswerRate.map((goodAnswers: number) => goodAnswers / quiz.games.length);
    }
}
