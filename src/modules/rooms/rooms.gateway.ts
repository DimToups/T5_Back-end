import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Logger} from "@nestjs/common";
import {Server} from "socket.io";

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

    async handleConnection(client: any){
        try{
            // TODO
            // await this.authGuardService.authenticate(client.handshake);
            if(!this.roomClients.has(client.handshake.roomCode))
                this.roomClients.set(client.handshake.roomCode, [client]);
            else
                this.roomClients.get(client.handshake.roomCode).push(client);
            this.logger.log(`Client ${client.handshake.playerName} connected to room ${client.handshake.roomCode}`);
        }catch(_: any){
            client.disconnect();
            return;
        }
    }

    async handleDisconnect(client: any){
        if(this.roomClients.has(client.handshake.roomCode)){
            const index: number = this.roomClients.get(client.handshake.roomCode).indexOf(client);
            if(index !== -1)
                this.roomClients.get(client.handshake.roomCode).splice(index, 1);
            if(this.roomClients.get(client.handshake.roomCode).length === 0)
                this.roomClients.delete(client.handshake.roomCode);
            this.logger.log(`Client ${client.handshake.playerName} disconnected from room ${client.handshake.roomCode}`);
        }
    }
}
