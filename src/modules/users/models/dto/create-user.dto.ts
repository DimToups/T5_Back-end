import {IsAlphanumeric, IsEmail, IsNotEmpty, IsString, Length} from "class-validator";
import {ChangeUsernameDto} from "./change-username.dto";

export class CreateUserDto extends ChangeUsernameDto{
    @IsNotEmpty()
    @IsAlphanumeric()
    @Length(3, 30)
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    password: string;
}
