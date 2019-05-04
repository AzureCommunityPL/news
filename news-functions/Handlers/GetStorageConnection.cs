using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using NewsFunctions.Helpers;
using NewsFunctions.Models;

namespace NewsFunctions.Handlers
{
    public static class GetStorageConnection
    {
        [FunctionName(nameof(GetStorageConnection))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            var policy = new SharedAccessTablePolicy()
            {
                SharedAccessExpiryTime = DateTime.UtcNow.AddDays(1),
                Permissions = SharedAccessTablePermissions.Query
            };

            var storageAccount = CloudStorageAccount.Parse(EnvironmentHelper.GetEnv("AccountStorage-Conn"));
            var tableClient = storageAccount.CreateCloudTableClient() ??
                              throw new Exception(nameof(storageAccount.CreateCloudTableClient));
            var table = tableClient.GetTableReference("news") ??
                        throw new Exception(nameof(tableClient.GetTableReference));

            var sasToken = table.GetSharedAccessSignature(policy);

            if (string.IsNullOrEmpty(sasToken))
            {
                throw new NullReferenceException("Token is null");
            }

            var query = new TableQuery<NewsTable>().Select(new List<string>() { nameof(NewsTable.PartitionKey) });

            var list = new List<string>();
            TableContinuationToken continuationToken = null;
            do
            {
                var resultSegment = await table.ExecuteQuerySegmentedAsync(query, continuationToken);
                continuationToken = resultSegment.ContinuationToken;

                foreach (var entity in resultSegment.Results.Distinct()
                    .Where(l => list.Contains(l.PartitionKey) == false))
                {
                    list.Add(entity.PartitionKey);
                }

            } while (continuationToken != null);

            return new OkObjectResult(new
            {
                sasToken = sasToken,
                storageAddress = $"{table.Uri.Scheme}://{table.Uri.Host}",
                tableName = "news",
                partitionKeys = list.Select(l => new
                {
                    partitionKey = l,
                    date = DateTimeHelper.GetDateFromPartition(l)
                }).OrderByDescending(d => d.date)
            });
        }

        
    }
}
