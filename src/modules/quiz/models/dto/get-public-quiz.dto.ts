import {PaginationDto} from "../../../../common/models/dto/pagination.dto";
import {IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";

export class GetPublicQuizDto extends PaginationDto{
    @IsString()
    @IsOptional()
    @ApiProperty({enum: Difficulties, required: false})
    difficulty?: Difficulties;

    @IsString()
    @IsOptional()
    @ApiProperty({enum: Categories, required: false})
    category?: Categories;

    @IsString()
    @IsOptional()
    search?: string;
}
