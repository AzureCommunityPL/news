import { DateService } from './date.service';
import 'jest';

describe('DateService', () => {
  let service: DateService = null;

  beforeEach(() => { service = new DateService(); });

  it('should create the service', () => {
    expect(service).not.toBe(undefined);
  });

  it('should calculate tail-log-ticks for Mon, 29 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const date = new Date('Mon, 29 Apr 2019 00:00:00 GMT');
    const expectedTicks = 2518457184000000000;

    // Act
    const result: number = service.getTicks(date);

    // Assert
    expect(result).toBe(expectedTicks);
  });

  it('should invert tail-log-ticks for Mon, 29 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const expectedDate = new Date('Mon, 29 Apr 2019 00:00:00 GMT');
    const ticks = 2518457184000000000;

    // Act
    const result: Date = service.getDate(ticks);

    // Assert
    expect(result).toEqual(expectedDate);
  });

  it('should calculate tail-log-ticks for Sun, 28 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const date = new Date('Sun, 28 Apr 2019 00:00:00 GMT');
    const expectedTicks = 2518458048000000000;

    // Act
    const result: number = service.getTicks(date);

    // Assert
    expect(result).toBe(expectedTicks);
  });

  it('should invert tail-log-ticks for Sun, 28 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const expectedDate = new Date('Sun, 28 Apr 2019 00:00:00 GMT');
    const ticks = 2518458048000000000;

    // Act
    const result: Date = service.getDate(ticks);

    // Assert
    expect(result).toEqual(expectedDate);
  });

  it('should calculate tail-log-ticks for Sat, 27 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const date = new Date('Sat, 27 Apr 2019 00:00:00 GMT');
    const expectedTicks = 2518458912000000000;

    // Act
    const result: number = service.getTicks(date);

    // Assert
    expect(result).toBe(expectedTicks);
  });

  it('should invert tail-log-ticks for Sat, 27 Apr 2019 00:00:00 GMT', () => {
    // Arrange
    const expectedDate = new Date('Sat, 27 Apr 2019 00:00:00 GMT');
    const ticks = 2518458912000000000;

    // Act
    const result: Date = service.getDate(ticks);

    // Assert
    expect(result).toEqual(expectedDate);
  });
});
