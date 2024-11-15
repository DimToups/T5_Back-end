import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean{
        // TODO
        return false;
    }
}
