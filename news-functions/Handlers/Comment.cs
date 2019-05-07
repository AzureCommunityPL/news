using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
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
    public static class Comment
    {
        private const string Route = "comment/{postId}";

        [FunctionName(nameof(HttpMethod.Post) + nameof(Comment))]
        public static async Task<IActionResult> RunPost(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = Route)] HttpRequest req,
            string postId,
            [Table("comments", Connection = "AccountStorage-Conn")]CloudTable collector,
            CancellationToken cancellationToken,
            ILogger log)
        {
            return await InternalExecution(req, postId, collector, cancellationToken, log, HttpOperation.Post);
        }

        [FunctionName(nameof(HttpMethod.Put) + nameof(Comment))]
        public static async Task<IActionResult> RunPut(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = Route)] HttpRequest req,
            string postId,
            [Table("comments", Connection = "AccountStorage-Conn")]CloudTable collector,
            CancellationToken cancellationToken,
            ILogger log)
        {
            return await InternalExecution(req, postId, collector, cancellationToken, log, HttpOperation.Put);
        }

        [FunctionName(nameof(HttpMethod.Delete) + nameof(Comment))]
        public static async Task<IActionResult> RunDelete(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = Route)] HttpRequest req,
            string postId,
            [Table("comments", Connection = "AccountStorage-Conn")]CloudTable collector,
            CancellationToken cancellationToken,
            ILogger log)
        {
            return await InternalExecution(req, postId, collector, cancellationToken, log, HttpOperation.Delete);
        }

        private static async Task<IActionResult> InternalExecution(HttpRequest req, string postId, CloudTable collector,
            CancellationToken cancellationToken, ILogger log, HttpOperation httpMethod)
        {
            try
            {
                log.LogInformation("C# HTTP trigger function processed a request.");

                if (req.Headers.TryGetValue("access_token", out var accessToken))
                {
                    log.LogInformation("Validating fb token");
                    var fbUser = await FacebookTokenValidation.IsTokenValid(accessToken, cancellationToken);
                    log.LogInformation($"Valid fb token, received userId : {fbUser.Id}");

                    log.LogInformation($"Invoking property method to {httpMethod} http method");
                    switch (httpMethod)
                    {
                        case HttpOperation.Post:
                        case HttpOperation.Put:
                            return await PostOrPutExecution(req, postId, collector, log, fbUser, httpMethod);
                        case HttpOperation.Delete:
                            return await DeleteExecution(postId, collector, log, fbUser);
                        default:
                            return new InternalServerErrorResult();

                    }                   
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

        private static async Task<IActionResult> DeleteExecution(string postId, CloudTable collector, ILogger log, FacebookProfileDto fbUser)
        {
            var partitionKey = postId;
            var rowKey = $"{fbUser.Id}";
            log.LogInformation(
                $"Trying delete comment, partitionKey: {partitionKey}, rowKey: {rowKey}");
            await collector.ExecuteAsync(
                TableOperation.Delete(new CommentTable
                {
                    PartitionKey = partitionKey,
                    RowKey = rowKey,
                    ETag = "*"
                }));

            log.LogInformation("Done");
            return new OkResult();
        }

        private static async Task<IActionResult> PostOrPutExecution(HttpRequest req, string postId, CloudTable collector, ILogger log,
            FacebookProfileDto fbUser, HttpOperation httpMethod)
        {
            log.LogInformation($"Trigger for {httpMethod} http method");

            log.LogInformation($"Reading body");
            var body = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrWhiteSpace(body))
            {
                log.LogWarning($"Empty Body");
                return new BadRequestResult();
            }

            log.LogInformation($"Received body : {body}, trying to deserialize");
            var comment = JsonConvert.DeserializeObject<CommentDto>(body);

            var partitionKey = postId;
            var rowKey = $"{fbUser.Id}";
            log.LogInformation(
                $"Deserialized, trying insert or replace comment, partitionKey: {partitionKey}, rowKey: {rowKey}");

            var tableEntity = new CommentTable
            {
                PartitionKey = partitionKey,
                RowKey = rowKey,
                Comment = comment.Comment,
                Title = comment.Title,
                ETag = "*"
            };

            TableOperation operation = null;

            switch (httpMethod)
            {
                case HttpOperation.Put:
                    log.LogInformation("Have chosen table operation Insert");
                    operation = TableOperation.Insert(tableEntity);
                    break;
                case HttpOperation.Post:
                    log.LogInformation("Have chosen table operation Replace");
                    operation = TableOperation.Replace(tableEntity);
                    break;
                default:
                    return new InternalServerErrorResult();
            }

            await collector.ExecuteAsync(operation);

            log.LogInformation("Done");
            if (httpMethod == HttpOperation.Post)
            {
                return  new OkObjectResult(body);
            }
            return new OkResult();
        }
    }
}
