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
                    var body = await new StreamReader(req.Body).ReadToEndAsync();
                    if (string.IsNullOrWhiteSpace(body))
                    {
                        return new BadRequestResult();
                    }
                    var comment = JsonConvert.DeserializeObject<CommentDto>(body);

                    var graphResponse = await _httpClient.SendAsync(new HttpRequestMessage()
                    {
                        RequestUri = new Uri("https://graph.facebook.com/v2.11/me?fields=id"),
                        Method = HttpMethod.Get,
                        Headers = { {"Authorization", $"Bearer {accessToken.ToString()}" } }
                    }, cancellationToken);
                    graphResponse.EnsureSuccessStatusCode();
                    var graphContent = await graphResponse.Content.ReadAsStringAsync();

                    var fbProfile = JsonConvert.DeserializeObject<FacebookProfileDto>(graphContent); 

                   await collector.ExecuteAsync(
                       TableOperation.InsertOrReplace(new CommentTable
                        {
                            PartitionKey= DateTimeHelper.InvertTicks(comment.PostDateTime),
                            RowKey = $"{comment.PostId}/comment/{fbProfile.Id}",
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
