
export interface NewsDto {
    'odata.etag': string;
    PartitionKey: string;
    RowKey: string;
    TimeStamp: Date;
    Title: string;
    Summary: string;
    Url: string;
}

export interface NewsResponseDto {
    'odata.metadata': string;
    value: NewsDto[];
}
