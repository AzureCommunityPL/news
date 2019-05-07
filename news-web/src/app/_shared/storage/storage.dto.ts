import { ODataResponseDto, ODataValueDto } from '../odata';

// News
export interface NewsDto extends ODataValueDto {
    Title: string;
    Summary: string;
    Url: string;
}

export interface NewsResponseDto extends ODataResponseDto<NewsDto> {
}

// Comments
export interface CommentDto extends ODataValueDto {
    Title?: string;
    Comment: string;
}

export interface CommentResponseDto extends ODataResponseDto<CommentDto> {
}
