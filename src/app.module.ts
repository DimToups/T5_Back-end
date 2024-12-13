import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {ThrottlerModule} from "@nestjs/throttler";
import * as dotenv from "dotenv";
import {CacheModule} from "@nestjs/cache-manager";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {UsersModule} from "./modules/users/users.module";
import {EnumsModule} from "./modules/enums/enums.module";
import {CronModule} from "./modules/cron/cron.module";
import {QuestionsModule} from "./modules/questions/questions.module";
import {QuizModule} from "./modules/quiz/quiz.module";
import {GamesModule} from "./modules/games/games.module";
import {StatisticsModule} from "./modules/statistics/statistics.module";
import {RoomsModule} from "./modules/rooms/rooms.module";

dotenv.config();

@Module({
    controllers: [AppController],
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 60,
        }]),
        CacheModule.register({isGlobal: true}),
        EnumsModule,
        UsersModule,
        CronModule,
        QuestionsModule,
        QuizModule,
        GamesModule,
        StatisticsModule,
        RoomsModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule{}
