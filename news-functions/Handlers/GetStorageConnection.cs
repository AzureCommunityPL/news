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
        private const string _route = "{tableName}/";

        [FunctionName("AccessToken")]
        public static async Task<IActionResult> Runtoken(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = _route + "token")]HttpRequest req,
            string tableName,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                var policy = new SharedAccessTablePolicy()
                {
                    SharedAccessExpiryTime = DateTime.UtcNow.AddDays(1),
                    Permissions = SharedAccessTablePermissions.Query
                };
                log.LogInformation("created sas policy");

                var storageAccount = CloudStorageAccount.Parse(EnvironmentHelper.GetEnv("AccountStorage-Conn"));
                var tableClient = storageAccount.CreateCloudTableClient() ??
                                  throw new Exception(nameof(storageAccount.CreateCloudTableClient));
                log.LogInformation($"Connected to storage account");

                var table = tableClient.GetTableReference(tableName);
                log.LogInformation($"Connected to table {tableName}");

                var sasToken = table.GetSharedAccessSignature(policy);
                log.LogInformation($"Generated sas token {sasToken}");

                if (string.IsNullOrEmpty(sasToken))
                {
                    log.LogError("Token is null");
                    throw new NullReferenceException("Token is null");
                }

                return new OkObjectResult(new
                {
                    sas = sasToken,
                    name = tableName
                });
            }
            catch (StorageException ex) when (ex.Message.Contains("Not Found"))
            {
                return new NotFoundObjectResult($"Table {tableName} doesn't exist");
            }
        }

        [FunctionName("PartitionCount")]
        public static async Task<IActionResult> RunCount(
           [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = _route + "count")]HttpRequest req,
           string tableName,
           ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                var storageAccount = CloudStorageAccount.Parse(EnvironmentHelper.GetEnv("AccountStorage-Conn"));
                var tableClient = storageAccount.CreateCloudTableClient() ??
                                  throw new Exception(nameof(storageAccount.CreateCloudTableClient));
                log.LogInformation($"Connected to storage account");

                var table = tableClient.GetTableReference(tableName);

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
                log.LogInformation($"fetched all records");
                
                var numberGroups = list.GroupBy(p => p);

                return new OkObjectResult(
                    numberGroups.Select(grp => new
                    {
                        partionKey = grp.Key,
                        count = grp.Count()

                    }));
            }
            catch (StorageException ex) when (ex.Message.Contains("Not Found"))
            {
                return new NotFoundObjectResult($"Table {tableName} doesn't exist");
            }
        }
    }
}
