using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Table;
using NewsFunctions.Extensions;
using NewsFunctions.Helpers;
using NewsFunctions.Models;
using Newtonsoft.Json;

namespace NewsFunctions.Handlers
{
    public static class Unlike
    {
        [FunctionName(nameof(Unlike))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            [Table("%TableStorage-Name%", Connection = "AccountStorage-Conn")] CloudTable cloudTable,
            CancellationToken cancellationToken,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            if (req.Headers.TryGetValue(FacebookTokenValidation.AccessToken, out var accessToken))
            {
                log.LogInformation("Validating fb token");
                var fbUser = await FacebookTokenValidation.IsTokenValid(accessToken, cancellationToken);
                log.LogInformation($"Valid fb token, received userId : {fbUser.Id}");

                log.LogInformation($"Reading body");
                var body = await new StreamReader(req.Body).ReadToEndAsync();
                if (string.IsNullOrWhiteSpace(body))
                {
                    log.LogWarning($"Empty Body");
                    return new BadRequestResult();
                }

                log.LogInformation($"Received body : {body}, trying to deserialize");
                var likeDto = JsonConvert.DeserializeObject<LikeDto>(body);
                log.LogInformation("Deserialized");

                var partitionKey = DateTimeHelper.InvertTicks(likeDto.PostDate);
                var rowKey = $"{likeDto.PostId}~comment~{fbUser.Id}~like";
                
                log.LogInformation($"Retrieving record by partitionKey: {partitionKey} and rowKey: {rowKey}");
                var likeRecord = await cloudTable.Get<TableEntity>(partitionKey, rowKey);

                if (likeRecord != null)
                {
                    log.LogInformation($"Deleting record :{partitionKey} - {rowKey}");
                    await cloudTable.ExecuteAsync(TableOperation.Delete(likeRecord));
                    log.LogInformation($"Deleted record :{partitionKey} - {rowKey}");
                }
                else
                {
                    log.LogInformation($"Not Found");
                    return  new NotFoundResult();
                }

                log.LogInformation("Done");
                return new OkResult();
            }

            return new BadRequestResult();
        }
    }
}