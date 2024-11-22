import {PaginationDto} from "../../../../common/models/dto/pagination.dto";
import {Categories, Difficulties} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsOptional, IsString} from "class-validator";

export class GetQuestionsDto extends PaginationDto{
    @ApiProperty({enum: Difficulties, required: false})
    @IsString()
    @IsOptional()
    @IsEnum(Difficulties)
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories, required: false})
    @IsString()
    @IsOptional()
    @IsEnum(Categories)
    category?: Categories;

    @IsString()
    @IsOptional()
    search?: string;
}
