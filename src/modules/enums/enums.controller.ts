import {Controller, Get} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {Categories, Difficulties} from "@prisma/client";
import {CacheTTL} from "@nestjs/cache-manager";

@Controller("enums")
@ApiTags("Enums")
export class EnumsController{

    /**
     * Get the difficulties
     *
     * @throws {500} Internal Server Error
     */
    @Get("difficulties")
    @CacheTTL(3600 * 1000)
    getDifficulties(): string[]{
        return Object.keys(Difficulties);
    }

    /**
     * Get the categories
     *
     * @throws {500} Internal Server Error
     */
    @Get("categories")
    @CacheTTL(3600 * 1000)
    getCategories(): string[]{
        return Object.keys(Categories);
    }
}
