import { DateService } from './date.service';
import 'jest';

describe('DateService', () => {
  let service: DateService = null;

  beforeEach(() => { service = new DateService(); });

  it('should create the service', () => {
    expect(service).not.toBe(undefined);
  });

  const testData = [
    {
      date: new Date('Mon, 29 Apr 2019 00:00:00 GMT'),
      ticks: 2518457184000000000
    },
    {
      date: new Date('Sun, 28 Apr 2019 00:00:00 GMT'),
      ticks: 2518458048000000000
    },
    {
      date: new Date('Sat, 27 Apr 2019 00:00:00 GMT'),
      ticks: 2518458912000000000
    }
  ];

  testData.forEach(x => {
    it(`should calculate tail-log-ticks for ${x.date}`, () => {
      const result: number = service.getTicks(x.date);
      expect(result).toBe(x.ticks);
    });

    it(`should invert tail-log-ticks for ${x.date}`, () => {
      const result: Date = service.getDate(x.ticks);
      expect(result).toEqual(x.date);
    });
  });
});
