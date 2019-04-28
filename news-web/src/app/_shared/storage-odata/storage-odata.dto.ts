
export interface ODataNewsDto {
    'odata.etag': string;
    PartitionKey: string;
    RowKey: string;
    TimeStamp: Date;
    Title: string;
    Summary: string;
    Url: string;
}

export interface ODataNewsResponseDto {
    'odata.metadata': string;
    value: ODataNewsDto[];
}
