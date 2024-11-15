import {UsersService} from "./users.service";
import {AuthService} from "./auth.service";
import {
    Body,
    Controller,
    Delete,
    Get, HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {CreateUserResponse} from "./models/responses/create-user.response";
import {CreateUserDto} from "./models/dto/create-user.dto";
import {LoginUserDto} from "./models/dto/login-user.dto";
import {AuthGuard} from "./guards/auth.guard";
import {UserEntity} from "./models/entities/user.entity";
import {UserProfileEntity} from "./models/entities/user-profile.entity";
import {AuthenticatedRequest} from "./models/models/authenticated-request";

@Controller("users")
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
        const user: UserEntity = await this.usersService.createUser(createUserDto.username, createUserDto.email, createUserDto.password);
        const session: string = await this.authService.createSession(user.username, createUserDto.password);
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
        const user: UserEntity = await this.usersService.getUserFromEmail(loginUserDto.email);
        if(!user)
            throw new NotFoundException("User not found");
        const session: string = await this.authService.createSession(user.username, loginUserDto.password);
        return new CreateUserResponse(user, session);
    }

    @Delete("logout")
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async logout(@Req() request: AuthenticatedRequest): Promise<void>{
        await this.authService.deleteSession(request.sessionId);
    }

    /**
     * Get the current user
     *
     * @throws {401} Unauthorized
     * @throws {500} Internal Server Error
     */
    @Get("me")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async me(@Req() request: AuthenticatedRequest): Promise<UserEntity>{
        return request.user;
    }

    /**
     * Get a user's profile
     *
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Get(":user_id")
    async getUserProfile(@Param("user_id") userId: string): Promise<UserProfileEntity>{
        return await this.usersService.getUserProfile(userId);
    }

    /**
     * Delete the current user
     *
     * @throws {401} Unauthorized
     * @throws {500} Internal Server Error
     */
    @Delete("/me")
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async deleteUser(@Req() request: AuthenticatedRequest): Promise<void>{
        await this.usersService.deleteUser(request.user.id);
    }
}
