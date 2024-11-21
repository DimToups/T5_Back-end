import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {GamesController} from "./games.controller";
import {GamesService} from "./games.service";

@Module({
    controllers: [GamesController],
    providers: [GamesService],
    imports: [ServicesModule],
})
export class GamesModule{}
