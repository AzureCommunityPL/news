using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
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


            return new OkResult();
        }
    }
}
