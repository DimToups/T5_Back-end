import {Controller, Get, Param} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {StatisticsService} from "./statistics.service";
import {QuizStatisticEntity} from "./model/entities/quiz-statistic.entity";

@Controller("statistics")
@ApiTags("Statistics")
export class StatisticsController{
    constructor(
        private readonly statisticsService: StatisticsService,
    ){}

    @Get("quiz_id")
    async getQuizStatistics(@Param("quiz_id") quizId: string): Promise<QuizStatisticEntity>{
        return this.statisticsService.getQuizStatistics(quizId);
    }
}
