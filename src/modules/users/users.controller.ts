import {ClassSerializerInterceptor, Controller, Get, UseInterceptors} from "@nestjs/common";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UsersService} from "./users.service";
import {AuthService} from "./auth.service";
import {UserEntity} from "./models/user.entity";

@Controller()
@ApiTags("Users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ){}

    /**
     * Create a new cat
     *
     * @remarks This operation allows you to create a new cat.
     *
     * @throws {500} Something went wrong.
     * @throws {400} Bad Request.
     */
    @Get("test")
    test(): UserEntity{
        return new UserEntity({
            id: 1,
            username: "test",
            email: "email",
            password: "password",
        });
    }
}
