import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {ThrottlerModule} from "@nestjs/throttler";
import * as dotenv from "dotenv";
import {QuizModule} from "./modules/quiz/quiz.module";
import {CacheModule} from "@nestjs/cache-manager";

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
        QuizModule,
    ]
})
export class AppModule{}
