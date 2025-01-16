import {QuestionsService} from "./questions.service";
import {QuestionsController} from "./questions.controller";
import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {FileModule} from "../file/file.module";

@Module({
    imports: [ServicesModule, FileModule],
    controllers: [QuestionsController],
    providers: [QuestionsService],
    exports: [QuestionsService],
})
export class QuestionsModule{}
