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
        private const string _route = "{tableName}/token";

        [FunctionName(nameof(GetStorageConnection))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = _route)]HttpRequest req,
            string tableName,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

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
    }
}
