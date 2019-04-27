using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;

namespace news_functions
{
    public static class GetPartitions
    {
        [FunctionName(nameof(GetPartitions))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]
            HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            var tableName = EnvironmentHelper.GetEnv("TableStorage-Name");
            var storageAccount = CloudStorageAccount.Parse(EnvironmentHelper.GetEnv("AccountStorage-Conn"));
            var tableClient = storageAccount.CreateCloudTableClient() ??
                              throw new Exception(nameof(storageAccount.CreateCloudTableClient));
            var table = tableClient.GetTableReference(tableName) ??
                        throw new Exception(nameof(tableClient.GetTableReference));
            var query = new TableQuery<NewsTable>().Select(new List<string>() { nameof(NewsTable.PartitionKey) });

            var list = new List<string>();
            TableContinuationToken token = null;
            do
            {
                var resultSegment = await table.ExecuteQuerySegmentedAsync(query, token);
                token = resultSegment.ContinuationToken;

                foreach (var entity in resultSegment.Results.Distinct().Where(l => list.Contains(l.PartitionKey) == false))
                {
                    list.Add(entity.PartitionKey);
                }
            } while (token != null);

            return new OkObjectResult(
                list.Select(l => new
                    {
                        partitionKey = l,
                        date = GetDateFromPartition(l)
                })
            );
        }

        private static DateTime GetDateFromPartition(string partitionKey)
        {
            var ticks = long.Parse(partitionKey);
            var dateNowTicks = DateTime.MaxValue.Ticks - ticks;
            return new DateTime(dateNowTicks).ToUniversalTime();
        }
    }
}
