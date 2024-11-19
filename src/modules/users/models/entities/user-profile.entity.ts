import {UserEntity} from "./user.entity";

export class UserProfileEntity{
    id: string;
    username: string;

    constructor(partial: Partial<UserEntity>){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password, email, ...userProfile} = partial;
        Object.assign(this, userProfile);
    }
}
