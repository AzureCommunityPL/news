import { DateService } from './date.service';
import 'jest';

describe('DateService', () => {
  let service: DateService = null;

  beforeEach(() => { service = new DateService(); });

  it('should calculate ticks for Sun, 28 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const date = new Date('Sun, 28 Apr 2019 00:00:00 GMT');
    const expectedTicks = 2518458048000000000;

    // Act
    const result: number = service.getTicks(date);

    // Assert
    expect(result).toBe(expectedTicks);
  });
});
// describe('DateService', () => {
//   // service: DateService = undefined;
//   beforeEach(() => { service = new DateService(); });

//   it('#getValue should return real value', () => {
//     //expect(service.getValue()).toBe('real value');
//   });

//   it('#getObservableValue should return value from observable',
//       // (done: DoneFn) => {
//       // service.getObservableValue().subscribe(value => {
//       //   expect(value).toBe('observable value');
//       //   done();
//       // });
//     });

// it('#getPromiseValue should return value from a promise',
//       // (done: DoneFn) => {
//       // service.getPromiseValue().then(value => {
//       //   expect(value).toBe('promise value');
//       //   done();
//       // });
//     });
// });