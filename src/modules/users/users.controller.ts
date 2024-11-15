import {UsersService} from "./users.service";
import {AuthService} from "./auth.service";
import {Body, Controller, NotFoundException, Post} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {CreateUserResponse} from "./models/responses/create-user.response";
import {CreateUserDto} from "./models/dto/create-user.dto";
import {LoginUserDto} from "./models/dto/login-user.dto";

@Controller()
@ApiTags("Users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ){}

    /**
     * Create a new user and session
     *
     * @throws {409} Conflict
     * @throws {500} Internal Server Error
     */
    @Post("create")
    async createUser(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse>{
        const user = await this.usersService.createUser(createUserDto.username, createUserDto.email, createUserDto.password);
        const session = await this.usersService.createSession(user.username, createUserDto.password);
        return new CreateUserResponse(user, session);
    }

    /**
     * Login a user
     *
     * @throws {401} Unauthorized
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Post("login")
    async loginUser(@Body() loginUserDto: LoginUserDto): Promise<CreateUserResponse>{
        const user = await this.usersService.getUserFromEmail(loginUserDto.email);
        if(!user)
            throw new NotFoundException("User not found");
        const session = await this.usersService.createSession(user.username, loginUserDto.password);
        return new CreateUserResponse(user, session);
    }
}
