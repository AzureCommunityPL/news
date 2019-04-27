using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System.Configuration;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace NewsFunctions
{
    public static class GenerateSAS
    {
        [FunctionName(nameof(GenerateSAS))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)]
            HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            var tableName = GetEnv("TableStorage-Name");

            var policy = new SharedAccessTablePolicy()
            {
                SharedAccessExpiryTime = DateTime.UtcNow.AddDays(1),
                Permissions =  SharedAccessTablePermissions.Query
            };

            var storageAccount = CloudStorageAccount.Parse(GetEnv("AccountStorage-Conn"));
            var tableClient = storageAccount.CreateCloudTableClient() ?? throw new Exception(nameof(storageAccount.CreateCloudTableClient));            
            var table = tableClient.GetTableReference(tableName) ?? throw new Exception(nameof(tableClient.GetTableReference));
            await table.CreateIfNotExistsAsync();
            
            var token = table.GetSharedAccessSignature(policy);
            
            if (string.IsNullOrEmpty(token))
            {
                throw new NullReferenceException("Token is null");
            }

            return (ActionResult)new OkObjectResult(new {
                sasToken =  token,
                tableUri = table.Uri
            });
        }

        private static string GetEnv(string name)
        {
            return Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.Process)??
                   throw new ArgumentException($"{nameof(name)}: {name}");
        }
    }    
}
