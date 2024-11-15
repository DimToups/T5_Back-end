import {UserEntity} from "./user.entity";

export type PublicUserEntity = Omit<UserEntity, "password">;
