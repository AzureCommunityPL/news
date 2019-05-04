export interface TableEntity {
    partitioningKey: string;
    rowKey: string;
}

export interface NewsItemModel extends TableEntity {
    title: string;
    summary: string;
    url: string;
}

export interface CommentModel {
    title?: string;
    comment: string;
    userId: string;
}
