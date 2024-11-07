import {Module} from "@nestjs/common";
import {QuestionsService} from "./questions.service";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    imports: [ServicesModule],
    providers: [QuestionsService],
    exports: [QuestionsService],
    controllers: [],
})
export class QuestionsModule{}
