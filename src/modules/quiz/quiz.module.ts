import {Module} from "@nestjs/common";
import {QuizController} from "./quiz.controller";

@Module({
    imports: [],
    exports: [],
    controllers: [QuizController],
    providers: []
})
export class QuizModule{}
