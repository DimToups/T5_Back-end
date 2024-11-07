import {Module} from "@nestjs/common";
import {QuizController} from "./quiz.controller";
import {QuizService} from "./quiz.service";
import {ServicesModule} from "../../common/services/services.module";
import {QuestionsModule} from "../questions/questions.module";
import {QuizGuard} from "./guards/quiz.guard";

@Module({
    imports: [ServicesModule, QuestionsModule],
    exports: [],
    controllers: [QuizController],
    providers: [QuizService, QuizGuard],
})
export class QuizModule{}
