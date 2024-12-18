import {ApiBearerAuth, ApiBody, ApiConsumes, ApiTags} from "@nestjs/swagger";
import {
    BadRequestException,
    Controller,
    Param,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import {FileService} from "./file.service";
import {FileInterceptor} from "@nest-lab/fastify-multer";
import {AuthGuard} from "../users/guards/auth.guard";
import {MaybeAuthenticatedRequest} from "../users/models/models/maybe-authenticated-request";

@Controller("file")
@ApiTags("File")
export class FileController{
    constructor(
        private readonly fileService: FileService,
    ){}

    /**
     * Upload a file for an answer
     *
     * @throws {400} Bad Request
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {500} Internal Server Error
     * @returns {string} The file path
     */
    @Put(":answer_id")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file", {
        limits: {
            fileSize: 1024 * 1024 * 50,
        },
        fileFilter: (req, file, cb) => {
            if(!RegExp(/\/(jpg|jpeg|png|gif|webp|avif|mp3|opus|ogg|m4a|wav|flac|aac)$/).exec(file.mimetype)){
                return cb(new BadRequestException("Only images can be uploaded"), false);
            }
            cb(null, true);
        },
    }))
    @ApiBody({
        required: true,
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                    description: "The file to upload (image or sound)",
                },
            },
        },
    })
    async uploadFile(@Req() req: MaybeAuthenticatedRequest, @Param("answer_id") answerId: string, @UploadedFile() file: any): Promise<string>{
        return this.fileService.uploadFile(answerId, file, req.user);
    }
}
