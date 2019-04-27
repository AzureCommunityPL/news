using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace news_functions
{
    public static class PutNewsToTable
    {
        [FunctionName(nameof(PutNewsToTable))]
        public static async Task Run(
            [QueueTrigger("%Queue-Name%", Connection = "AccountStorage-Conn")]string item,
            [Table("%TableStorage-Name%", Connection = "AccountStorage-Conn")]IAsyncCollector<NewsTable> collector,
            ILogger log)
        {
            log.LogInformation($"C# Queue trigger function processed: {item}");
            var news = JsonConvert.DeserializeObject<News>(item);
            var invertedTicks = $"{DateTime.MaxValue.ToUniversalTime().Date.Ticks - news.Date.ToUniversalTime().Date.Ticks:D19}";

            var table = new NewsTable
            {
                PartitionKey = invertedTicks,
                RowKey = news.Id,
                Title = news.Title,
                Summary = news.Summary,
                Url = news.Url

            };
            await collector.AddAsync(table);
        }
    }

    public class News
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Summary { get; set; }
        public DateTime Date { get; set; }
    }
}
