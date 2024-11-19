import {Module} from "@nestjs/common";
import {SessionCleanupCron} from "./session-cleanup.cron";
import {UsersModule} from "../users/users.module";

@Module({
    providers: [SessionCleanupCron],
    imports: [UsersModule],
})
export class CronModule{}
