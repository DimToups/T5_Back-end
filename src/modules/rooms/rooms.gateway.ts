import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Logger} from "@nestjs/common";
import {Server} from "socket.io";
import {AuthenticatedSocketEntity} from "./models/entities/authenticated-socket.entity";
import {RoomAuthGuard} from "./guards/room.guard";
import {CompleteRoomEntity} from "./models/entities/complete-room.entity";
import {QuestionResponse} from "./models/responses/question.response";

@WebSocketGateway({
    namespace: "rooms",
    cors: {
        origin: "*",
    },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect{
    private readonly logger: Logger = new Logger(RoomsGateway.name);
    @WebSocketServer() server: Server;
    private readonly roomClients: Map<string, AuthenticatedSocketEntity[]> = new Map<string, AuthenticatedSocketEntity[]>();

    constructor(
        private readonly roomAuthGuardService: RoomAuthGuard,
    ){}

    async handleConnection(client: AuthenticatedSocketEntity): Promise<void>{
        try{
            await this.roomAuthGuardService.wsAuthenticate(client);
            if(!this.roomClients.has(client.room.id))
                this.roomClients.set(client.room.id, [client]);
            else
                this.roomClients.get(client.room.id).push(client);
            this.logger.log(`Client ${client.player.id} connected to room ${client.room.id}`);
        }catch(_: any){
            client.disconnect();
            return;
        }
    }

    async handleDisconnect(client: AuthenticatedSocketEntity){
        if(!client.room?.id){
            this.logger.log("Unknown client disconnected");
            return;
        }
        if(this.roomClients.has(client.room.id)){
            const index: number = this.roomClients.get(client.room.id).indexOf(client);
            if(index !== -1)
                this.roomClients.get(client.room.id).splice(index, 1);
            if(this.roomClients.get(client.room.id).length === 0)
                this.roomClients.delete(client.room.id);
            this.logger.log(`Client ${client.player.id} disconnected from room ${client.room.id}`);
        }
    }

    private onEvent(roomId: string, eventName: string, data: any){
        if(this.roomClients.has(roomId)){
            this.roomClients.get(roomId).forEach((client: AuthenticatedSocketEntity) => client.emit(eventName, data));
            this.logger.log(`Event ${eventName} emitted for ${roomId}`);
        }
    }

    onRoomUpdate(roomId: string, data: CompleteRoomEntity): void{
        this.onEvent(roomId, "onRoomUpdate", data);
    }

    onRoomStart(roomId: string, data: CompleteRoomEntity & {endAt: Date;}){
        this.onEvent(roomId, "onRoomStart", data);
    }

    onQuestionStart(roomId: string, data: QuestionResponse){
        this.onEvent(roomId, "onQuestionStart", data);
    }

    onQuestionEnd(roomId: string, data: CompleteRoomEntity & {correctAnswer: string; endAt: Date;}){
        this.onEvent(roomId, "onQuestionEnd", data);
    }

    /**
     * Emit player answer
     * @param roomId
     * @param data who has answered
     */
    onPlayerAnswer(roomId: string, data: string[]){
        this.onEvent(roomId, "onPlayerAnswer", data);
    }

    onRoomEnd(roomId: string, data: CompleteRoomEntity){
        this.onEvent(roomId, "onRoomEnd", data);
    }
}
