import {ApiProperty} from "@nestjs/swagger";

export class DifficultyEntity{
    @ApiProperty()
        id: number;
    @ApiProperty()
        name: string;
}
