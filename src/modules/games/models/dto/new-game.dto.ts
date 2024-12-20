import {Difficulties} from "@prisma/client";
import {IsEnum, IsOptional} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class NewGameDto{
    @ApiProperty({enum: Difficulties})
    @IsEnum(Difficulties)
    @IsOptional()
    difficulty?: Difficulties;
}
