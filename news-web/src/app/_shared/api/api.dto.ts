export interface StorageConnectionDto {
    sasToken: string;
    storageAddress: string;
    tableName: string;
}

export interface CommentDto {
    title: string;
    comment: string;
}
