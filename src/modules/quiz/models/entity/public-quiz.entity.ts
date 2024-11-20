import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";

export class PublicQuizEntity{
    id: string;
    title: string;
    description?: string;
    @ApiProperty({enum: Difficulties})
        difficulty?: Difficulties;
    @ApiProperty({enum: Categories})
        category?: Categories;
    questionCount: number;
    userId?: string;

    constructor(partial: Partial<PublicQuizEntity>){
        Object.assign(this, partial);
    }
}
