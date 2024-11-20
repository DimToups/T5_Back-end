import {PaginationDto} from "../../../../common/models/dto/pagination.dto";
import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class GetQuestionsDto extends PaginationDto{
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
