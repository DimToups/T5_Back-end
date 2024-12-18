import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {RoomsController} from "./rooms.controller";
import {RoomsService} from "./rooms.service";
import {RoomsGateway} from "./rooms.gateway";
import {GamesModule} from "../games/games.module";
import {WsRoomAuthGuard} from "./guards/ws-room.guard";

@Module({
    imports: [ServicesModule, GamesModule],
    controllers: [RoomsController],
    providers: [RoomsService, RoomsGateway, WsRoomAuthGuard],
    exports: [],
})
export class RoomsModule{}
