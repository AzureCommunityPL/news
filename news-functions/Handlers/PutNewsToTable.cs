using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using news_functions.Helpers;
using news_functions.Models;
using Newtonsoft.Json;

namespace news_functions.Handlers
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
            var invertedTicks = DateTimeHelper.InvertTicks(news.Date);

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
}
