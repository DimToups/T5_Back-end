import {GameModes} from "@prisma/client";
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsAlphanumeric,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Max,
    Min,
} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateRoomDto{
    @IsOptional()
    @IsString()
    @IsAlphanumeric()
    @Length(3, 30)
    playerName?: string;

    @IsNotEmpty()
    @IsString()
    quizId: string;

    @ApiProperty({enum: GameModes})
    @IsEnum(GameModes)
    gameMode: GameModes;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(10)
    teams?: string[];

    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(10)
    maxPlayers?: number;
}
