import {ServicesModule} from "../../common/services/services.module";
import {Module} from "@nestjs/common";
import {FileController} from "./file.controller";
import {FileService} from "./file.service";

@Module({
    controllers: [FileController],
    providers: [FileService],
    imports: [ServicesModule],
    exports: [FileService],
})
export class FileModule{}
