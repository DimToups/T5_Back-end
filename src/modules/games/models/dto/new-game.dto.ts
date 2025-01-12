import {GameModes} from "@prisma/client";
import {IsEnum, IsOptional} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class NewGameDto{
    @ApiProperty({enum: GameModes})
    @IsEnum(GameModes)
    @IsOptional()
    gameMode?: GameModes;
}
