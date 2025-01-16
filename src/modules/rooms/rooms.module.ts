import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {RoomsController} from "./rooms.controller";
import {RoomsService} from "./rooms.service";
import {RoomsGateway} from "./rooms.gateway";
import {GamesModule} from "../games/games.module";
import {RoomAuthGuard} from "./guards/room.guard";
import {QuizModule} from "../quiz/quiz.module";

@Module({
    imports: [ServicesModule, GamesModule, QuizModule],
    controllers: [RoomsController],
    providers: [RoomsService, RoomsGateway, RoomAuthGuard],
    exports: [],
})
export class RoomsModule{}
