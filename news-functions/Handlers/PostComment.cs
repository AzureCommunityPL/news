using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Table;
using NewsFunctions.Helpers;
using NewsFunctions.Models;
using Newtonsoft.Json;

namespace NewsFunctions.Handlers
{
    public static class PostComment
    {
        private static HttpClient _httpClient = new HttpClient();

        [FunctionName(nameof(PostComment))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            [Table("comments", Connection = "AccountStorage-Conn")]CloudTable collector,
            CancellationToken cancellationToken,
            ILogger log)
        {
            try
            {
                log.LogInformation("C# HTTP trigger function processed a request.");

                if (req.Headers.TryGetValue("access_token", out var accessToken))
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
                    var comment = JsonConvert.DeserializeObject<CommentDto>(body);

                    var partitionKey = comment.PostId;
                    var rowKey = $"{fbUser.Id}";
                    log.LogInformation($"Deserialized, trying insert or replace comment, partitionKey: {partitionKey}, rowKey: {rowKey}");
                    await collector.ExecuteAsync(
                       TableOperation.InsertOrReplace(new CommentTable
                       {
                           PartitionKey = partitionKey,
                           RowKey = rowKey,
                           Comment = comment.Comment,
                           Title = comment.Title
                       }));

                    log.LogInformation("Done");
                    return new OkResult();
                }

                return new UnauthorizedResult();
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("401"))
            {
                return new UnauthorizedResult();
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("404"))
            {
                return new NotFoundResult();
            }
        }
    }
}
