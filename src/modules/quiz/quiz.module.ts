import {Module} from "@nestjs/common";
import {QuizController} from "./quiz.controller";
import {QuizService} from "./quiz.service";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    imports: [ServicesModule],
    exports: [],
    controllers: [QuizController],
    providers: [QuizService],
})
export class QuizModule{}
