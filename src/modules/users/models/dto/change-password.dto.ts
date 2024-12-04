import {IsNotEmpty, IsString, Length} from "class-validator";

export class ChangePasswordDto{
    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    newPassword: string;
}
