import {Module} from "@nestjs/common";
import {StatisticsController} from "./statistics.controller";
import {StatisticsService} from "./statistics.service";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService],
    imports: [ServicesModule],
})
export class StatisticsModule{}
