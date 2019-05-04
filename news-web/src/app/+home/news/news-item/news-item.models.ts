export interface TableEntity {
    partitioningKey: string;
    rowKey: string;
}

export interface NewsItemModel extends TableEntity {
    title: string;
    summary: string;
    url: string;
}

export interface CommentModel extends TableEntity {
    title?: string;
    comment: string;
    userId: string;
}

export interface CommentEditModel extends TableEntity {
    title?: string;
    comment: string;
}
