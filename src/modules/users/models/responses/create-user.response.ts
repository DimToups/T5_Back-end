import {UserEntity} from "../entities/user.entity";
import {ApiProperty} from "@nestjs/swagger";
import {faker} from "@faker-js/faker/locale/en";

export class CreateUserResponse{
    user: UserEntity;
    @ApiProperty({example: faker.string.uuid()})
    session: string;

    constructor(user: UserEntity, session: string){
        this.user = user;
        this.session = session;
    }
}
