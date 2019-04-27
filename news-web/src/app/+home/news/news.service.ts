import { Observable, BehaviorSubject } from 'rxjs';
import { NewsModel } from './news.model';

const newsTitles: string[] = [
    'news1',
    'news2',
    'news3',
    'news4',
    'news5',
    'news6',
    'news7',
    'news8',
    'news9',
    'news10'
];

const news: NewsModel[] = newsTitles.map<NewsModel>(n => ({
        title: n,
        url: `http://news.com/${n}`,
        partitioningKey: `${n}-PK`,
        rowKey: `${n}-RK`,
        lastModified: new Date(Date.now()),
        comments: []
}));
// const news: NewsModel[] = newsTitles.map<NewsModel>(n => { return new {

// };
// });
//     {
//         title: 'News',
//         url: '',
//         partitioninKey: '',
//         rowKey: '',
//         lastModified: Date,
//         comments: []
//     }
// ];

export class NewsService {
    public get news(): Observable<NewsModel[]> {
        return this.newsSubject.asObservable();
    }
    private newsSubject = new BehaviorSubject<NewsModel[]>(news);
}
