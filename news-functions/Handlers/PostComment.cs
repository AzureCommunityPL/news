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
            [Table("%TableStorage-Name%", Connection = "AccountStorage-Conn")]CloudTable collector,
            CancellationToken cancellationToken,
            ILogger log)
        {
            try
            {
                log.LogInformation("C# HTTP trigger function processed a request.");
                
                if (req.Headers.TryGetValue("access_token", out var accessToken))
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
                        return new BadRequestResult();
                    }
                    var comment = JsonConvert.DeserializeObject<CommentDto>(body);


                   await collector.ExecuteAsync(
                       TableOperation.InsertOrReplace(new CommentTable
                        {
                            PartitionKey= DateTimeHelper.InvertTicks(comment.PostDateTime),
                            RowKey = $"{comment.PostId}/comment/{comment.FbUserId}",
                            Comment =  comment.Comment,
                            Title = comment.Title
                       }));

                }

                return new UnauthorizedResult();
            }
            catch (HttpRequestException ex) when(ex.Message.Contains("401"))
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
