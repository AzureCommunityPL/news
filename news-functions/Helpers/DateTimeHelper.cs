using System;

namespace news_functions.Helpers
{
    public static class DateTimeHelper
    {
        public static DateTime GetDateFromPartition(string partitionKey)
        {
            var ticks = long.Parse(partitionKey);
            var dateNowTicks = DateTime.MaxValue.Ticks - ticks;
            return new DateTime(dateNowTicks).ToUniversalTime();
        }

        public static string InvertTicks(DateTime date) => $"{DateTime.MaxValue.ToUniversalTime().Date.Ticks - date.ToUniversalTime().Date.Ticks:D19}";

    }
}
