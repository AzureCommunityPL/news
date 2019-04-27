export interface NewsModel {
    title: string;
    url: string;
    partitioningKey: string;
    rowKey: string;
    lastModified: Date;
    comments: NewsCommentModel[];
}

export interface NewsCommentModel {
    userId: string;
    comment: string;
}