import {BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {RoomsService} from "./rooms.service";
import {MaybeAuthGuard} from "../users/guards/maybe-auth.guard";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {GameModes} from "@prisma/client";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";
import {CreateRoomResponse} from "./models/responses/create-room.response";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {RoomAuthGuard} from "./guards/room.guard";
import {AuthenticatedRequestEntity} from "./models/entities/authenticated-request.entity";

@Controller("rooms")
@ApiTags("Rooms")
export class RoomsController{
    constructor(
        private readonly roomsService: RoomsService,
    ){}

    @Post("create")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
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

    /**
     * Join a room
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Post(":room_id/join")
    @UseGuards(MaybeAuthGuard)
    @ApiBearerAuth()
    async joinRoom(@Req() req: MaybeAuthenticatedRequest, @Body() body: JoinRoomDto, @Param("room_id") roomId: string): Promise<CreateRoomResponse>{
        return this.roomsService.joinRoom(roomId, body, req.user);
    }

    /**
     * Start a room if player is owner
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Post("start")
    @UseGuards(RoomAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    async startRoom(@Req() req: AuthenticatedRequestEntity): Promise<void>{
        return this.roomsService.startRoom(req.room.id, req.player.id);
    }

    @Post("team/:team_id/join")
    @UseGuards(RoomAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    async joinTeam(@Req() req: AuthenticatedRequestEntity, @Param("team_id") teamId: string): Promise<void>{
        return this.roomsService.joinTeam(req.room.id, req.player.id, teamId);
    }
}
