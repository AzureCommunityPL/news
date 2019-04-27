export interface PictureResponseData {
    height: number;
    width: number;
    url: string;
    is_silhouette: boolean;
}

export interface PictureResponse {
    data: PictureResponseData;
}
