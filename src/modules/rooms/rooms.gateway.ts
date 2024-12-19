import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Logger} from "@nestjs/common";
import {Server} from "socket.io";
import {AuthenticatedSocketEntity} from "./models/entities/authenticated-socket.entity";
import {WsRoomAuthGuard} from "./guards/ws-room.guard";
import {CompleteRoomEntity} from "./models/entities/complete-room.entity";

@WebSocketGateway({
    namespace: "rooms",
    cors: {
        origin: "*",
    },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect{
    private readonly logger: Logger = new Logger(RoomsGateway.name);
    @WebSocketServer() server: Server;
    private readonly roomClients: Map<string, any[]> = new Map<string, any[]>();

    constructor(
        private readonly wsRoomAuthGuardService: WsRoomAuthGuard,
    ){}

    async handleConnection(client: AuthenticatedSocketEntity): Promise<void>{
        try{
            await this.wsRoomAuthGuardService.authenticate(client);
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

    onRoomUpdate(roomId: string, data: CompleteRoomEntity): void{
        if(this.roomClients.has(roomId))
            this.roomClients.get(roomId).forEach((client: AuthenticatedSocketEntity) => client.emit("onRoomUpdate", data));
    }
}
