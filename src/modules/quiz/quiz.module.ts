import {Module} from "@nestjs/common";
import {QuizController} from "./quiz.controller";
import {QuizService} from "./quiz.service";
import {ServicesModule} from "../../common/services/services.module";
import {QuestionsModule} from "../questions/questions.module";

@Module({
    controllers: [QuizController],
    providers: [QuizService],
    imports: [ServicesModule, QuestionsModule],
})
export class QuizModule{}
