import {IsAlphanumeric, IsNotEmpty, Length} from "class-validator";

export class ChangeUsernameDto{
    @IsNotEmpty()
    @IsAlphanumeric()
    @Length(3, 30)
    username: string;
}
