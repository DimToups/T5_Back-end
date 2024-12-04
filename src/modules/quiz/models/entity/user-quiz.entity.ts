import {ApiProperty} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";

export class UserQuizEntity{
    id: string;
    title: string;
    description?: string;
    questionCount: number;
    published: boolean;
    @ApiProperty({enum: Difficulties})
    difficulty?: Difficulties;

    @ApiProperty({enum: Categories})
    category?: Categories;
}
