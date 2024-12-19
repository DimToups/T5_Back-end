import {GameModes} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class RoomEntity{
    id: string;
    startedAt?: Date;
    maxPlayers: number;
    @ApiProperty({enum: GameModes})
    gameMode: GameModes;
}
