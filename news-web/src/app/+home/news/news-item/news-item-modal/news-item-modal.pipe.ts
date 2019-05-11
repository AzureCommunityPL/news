import { Pipe, PipeTransform } from '@angular/core';
import { NewsItemModalMode } from './news-item-modal.models';

@Pipe({
    name: 'newsItemModalToString'
})
export class NewsItemModalModeToStringPipe implements PipeTransform {
    public transform(value: NewsItemModalMode): any {
        return value === NewsItemModalMode.Create
            ? 'Create new comment'
            : 'Edit existing comment';
    }
}

@Pipe({
    name: 'newsItemModalBtnToString'
})
export class NewsItemModalBtnModeToStringPipe implements PipeTransform {
    public transform(value: NewsItemModalMode): any {
        return value === NewsItemModalMode.Create
            ? 'Create comment'
            : 'Update comment';
    }
}
