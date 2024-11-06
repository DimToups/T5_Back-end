import {Controller, Get, HttpStatus} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {VersionEntity} from "./common/models/entities/version.entity";

@Controller()
@ApiTags("Misc")
export class AppController{
    @Get("version")
    @ApiResponse({status: HttpStatus.OK, description: "Returns the version of the application", type: VersionEntity})
    getVersion(){
        return {version: process.env.npm_package_version};
    }
}
