export class DateService {
    /**
     * Converts a Date (at midnight UTC) to ticks
     * @param date The Date object
     */
    getTicks(date: Date): number {
        const maxTicks = 3155378112000000000;
        const epochTicks = 621355968000000000;
        const ticksPerMs = 10000;

        return maxTicks - ((date.setUTCHours(0, 0, 0, 0) * ticksPerMs) + epochTicks);
    }
}
