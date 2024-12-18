import {BadRequestException, Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {RoomsService} from "./rooms.service";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {GameModes} from "@prisma/client";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {CreateRoomResponse} from "./models/responses/create-room.response";

@Controller("rooms")
@ApiTags("Rooms")
export class RoomsController{
    constructor(
        private readonly roomsService: RoomsService,
    ){}

    /**
     * Create a room
     *
     * Player name is only required for anonymous users
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {500} Internal Server Error
     */
    @Post("create")
    @UseGuards(MaybeAuthGuard)
    async createRoom(@Req() req: MaybeAuthenticatedRequest, @Body() body: CreateRoomDto): Promise<CreateRoomResponse>{
        if(!body.playerName && !req.user)
            throw new BadRequestException("Player name required for anonymous users");
        if(body.gameMode !== GameModes.MULTIPLAYER
          && body.gameMode !== GameModes.TEAM_EASY
          && body.gameMode !== GameModes.TEAM_MEDIUM
          && body.gameMode !== GameModes.TEAM_HARD)
            throw new BadRequestException("Invalid game mode for room creation");
        if(body.gameMode === GameModes.MULTIPLAYER)
            return this.roomsService.createScrumRoom(body);
        return this.roomsService.createTeamRoom(body);
    }
}
