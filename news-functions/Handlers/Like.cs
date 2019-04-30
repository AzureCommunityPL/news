using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using NewsFunctions.Extensions;
using NewsFunctions.Helpers;
using NewsFunctions.Models;
using Newtonsoft.Json;

namespace NewsFunctions.Handlers
{
    public static class Like
    {
        [FunctionName(nameof(Like))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            [Table("%TableStorage-Name%", Connection = "AccountStorage-Conn")] CloudTable cloudTable,
            CancellationToken cancellationToken,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            if (req.Headers.TryGetValue(FacebookTokenValidation.AccessToken, out var accessToken))
            {
                var isValid = await FacebookTokenValidation.IsTokenValid(accessToken);
                if (isValid == false)
                {
                    log.LogInformation("Wrong token");
                    return new UnauthorizedResult();
                }

                var body = await new StreamReader(req.Body).ReadToEndAsync();
                if (string.IsNullOrWhiteSpace(body))
                {
                    log.LogInformation("Empty body");
                    return new BadRequestResult();
                }

                var likeDto = JsonConvert.DeserializeObject<LikeDto>(body);

                var partitionKey = DateTimeHelper.InvertTicks(likeDto.PostDate);
                var rowKey = $"{likeDto.PostId}%--%comment%--%{likeDto.FbUserId}%--%like";

                await cloudTable.ExecuteAsync(TableOperation.InsertOrReplace(new TableEntity(partitionKey, rowKey)));
                log.LogInformation($"Added record :{partitionKey} - {rowKey} ");

                return new OkResult();
            }

            return new BadRequestResult();
        }
    }
}
