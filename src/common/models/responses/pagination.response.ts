export class PaginationResponse<T>{
    data: T;
    total: number;
    take: number;
    skip: number;
}
