import {UserEntity} from "../../../users/models/entities/user.entity";

export class RoomPlayerEntity{
    id: string;
    roomId: string;
    user?: UserEntity;
    username?: string;
    owner: boolean;
    teamId?: string;
}
