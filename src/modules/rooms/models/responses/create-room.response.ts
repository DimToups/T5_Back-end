import {CompleteRoomEntity} from "../entities/complete-room.entity";
import {PublicQuizEntity} from "../../../quiz/models/entity/public-quiz.entity";

export class CreateRoomResponse extends CompleteRoomEntity{
    token: string;
    quiz: PublicQuizEntity;
}
