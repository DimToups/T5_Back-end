import {ApiProperty} from "@nestjs/swagger";

export class VersionEntity{
    @ApiProperty()
    version: string;
}
