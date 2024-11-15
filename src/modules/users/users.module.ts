import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {UsersService} from "./users.service";
import {AuthService} from "./auth.service";
import {UsersController} from "./users.controller";

@Module({
    imports: [ServicesModule],
    providers: [UsersService, AuthService],
    controllers: [UsersController],
    exports: []
})
export class UsersModule{}
