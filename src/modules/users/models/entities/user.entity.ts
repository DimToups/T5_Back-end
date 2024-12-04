import {ApiHideProperty, ApiProperty} from "@nestjs/swagger";
import {faker} from "@faker-js/faker/locale/en";
import {Exclude} from "class-transformer";

const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
};

export class UserEntity{
    @ApiProperty({example: faker.string.uuid()})
    id: string;

    @ApiProperty({example: faker.internet.username({firstName: user.firstName, lastName: user.lastName})})
    username: string;

    @ApiProperty({example: faker.internet.email({firstName: user.firstName, lastName: user.lastName})})
    email: string;

    @Exclude()
    @ApiHideProperty()
    password: string;

    constructor(partial: Partial<UserEntity>){
        Object.assign(this, partial);
    }
}
