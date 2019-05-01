export class DateService {
    private readonly maxTicks = 3155378112000000000;
    private readonly epochTicks = 621355968000000000;
    private readonly ticksPerMs = 10000;

    /**
     * Converts a Date (at midnight UTC) to ticks
     * @param date The Date object
     */
    getTicks(date: Date): number {
        return this.maxTicks - ((date.setUTCHours(0, 0, 0, 0) * this.ticksPerMs) + this.epochTicks);
    }

    /**
     * Converts tail-log ticks back to Date
     * @param ticks The tail log ticks
     */
    getDate(ticks: number): Date {
        const utcTicks = this.maxTicks - this.epochTicks - ticks;

        return new Date(utcTicks / this.ticksPerMs);
    }
}
