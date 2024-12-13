import {BadRequestException, Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {RoomsService} from "./rooms.service";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {GameModes} from "@prisma/client";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";

@Controller("rooms")
@ApiTags("Rooms")
export class RoomsController{
    constructor(
        private readonly roomsService: RoomsService,
    ){}

    @Post("create")
    @UseGuards(MaybeAuthGuard)
    async createRoom(@Req() req: MaybeAuthenticatedRequest, @Body() body: CreateRoomDto){
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
