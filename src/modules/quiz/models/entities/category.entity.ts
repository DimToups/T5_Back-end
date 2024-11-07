import {ApiProperty} from "@nestjs/swagger";

export class CategoryEntity{
    @ApiProperty()
        id: number;
    @ApiProperty()
        name: string;
}
