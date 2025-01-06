import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {GamesController} from "./games.controller";
import {GamesService} from "./games.service";
import {QuizModule} from "../quiz/quiz.module";
import {QuestionsModule} from "../questions/questions.module";
import {FileModule} from "../file/file.module";

@Module({
    controllers: [GamesController],
    providers: [GamesService],
    imports: [ServicesModule, QuizModule, QuestionsModule, FileModule],
    exports: [GamesService],
})
export class GamesModule{}
