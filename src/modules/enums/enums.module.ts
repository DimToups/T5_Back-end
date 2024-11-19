import {Module} from "@nestjs/common";
import {EnumsController} from "./enums.controller";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    controllers: [EnumsController],
    imports: [ServicesModule],
})
export class EnumsModule{}
