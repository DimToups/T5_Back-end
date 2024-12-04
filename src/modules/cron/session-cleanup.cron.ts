import {Injectable, Logger} from "@nestjs/common";
import {Cron, CronExpression} from "@nestjs/schedule";
import {AuthService} from "../users/auth.service";

@Injectable()
export class SessionCleanupCron{
    private logger: Logger = new Logger(SessionCleanupCron.name);

    constructor(
        private readonly authService: AuthService,
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupSessions(){
        this.logger.log("Cleaning up sessions");
        const count = await this.authService.cleanupSessions();
        this.logger.log(`Cleaned up ${count} sessions`);
    }
}
