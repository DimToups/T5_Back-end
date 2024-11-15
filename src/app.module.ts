import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {ThrottlerModule} from "@nestjs/throttler";
import * as dotenv from "dotenv";
import {CacheModule} from "@nestjs/cache-manager";
import {APP_INTERCEPTOR} from "@nestjs/core";

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
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        }
    ]
})
export class AppModule{}
