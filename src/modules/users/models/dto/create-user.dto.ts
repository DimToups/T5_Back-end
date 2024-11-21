import {IsEmail, IsNotEmpty, Length} from "class-validator";

export class CreateUserDto{
    @IsNotEmpty()
    @Length(3, 30)
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}
