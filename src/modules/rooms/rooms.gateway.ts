import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Logger} from "@nestjs/common";
import {Server} from "socket.io";
import {AuthenticatedSocketEntity} from "./models/entities/authenticated-socket.entity";
import {WsRoomAuthGuard} from "./guards/ws-room.guard";

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
            if(!this.roomClients.has(client.room.gameId))
                this.roomClients.set(client.room.gameId, [client]);
            else
                this.roomClients.get(client.room.gameId).push(client);
            this.logger.log(`Client ${client.player.id} connected to room ${client.room.gameId}`);
        }catch(_: any){
            client.disconnect();
            return;
        }
    }

    async handleDisconnect(client: AuthenticatedSocketEntity){
        if(!client.room?.gameId){
            this.logger.log("Unknown client disconnected");
            return;
        }
        if(this.roomClients.has(client.room.gameId)){
            const index: number = this.roomClients.get(client.room.gameId).indexOf(client);
            if(index !== -1)
                this.roomClients.get(client.room.gameId).splice(index, 1);
            if(this.roomClients.get(client.room.gameId).length === 0)
                this.roomClients.delete(client.room.gameId);
            this.logger.log(`Client ${client.player.id} disconnected from room ${client.room.gameId}`);
        }
    }
}
