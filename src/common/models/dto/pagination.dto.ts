import {IsNumber, IsOptional, Min} from "class-validator";

export class PaginationDto{
    @IsNumber()
    @Min(1)
    @IsOptional()
        take?: number;
    @IsNumber()
    @Min(0)
    @IsOptional()
        skip?: number;
}
