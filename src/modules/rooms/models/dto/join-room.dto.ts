import {IsAlphanumeric, IsOptional, IsString, Length} from "class-validator";

export class JoinRoomDto{
    @IsOptional()
    @IsString()
    @IsAlphanumeric()
    @Length(3, 30)
    playerName?: string;
}
