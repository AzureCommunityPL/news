using System;
using System.IO;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace news_functions.Handlers
{
    public static class PostComment
    {
        private static HttpClient _httpClient = new HttpClient();

        [FunctionName(nameof(PostComment))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            ExecutionContext context,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            if (req.Headers.TryGetValue("ACCESS_TOKEN",out var accessToken))
            {
                var fbAuth = await _httpClient.SendAsync(new HttpRequestMessage()
                {
                    RequestUri = new Uri($"https://{EnvironmentHelper.GetEnv("WEBSITE_SITE_NAME")}.azurewebsites.net/.auth/login/facebook"),
                    Method = HttpMethod.Post,
                    Headers = { { "X-ZUMO-AUTH", accessToken.ToString() } }
                });
            }
            return new UnauthorizedResult();
        }
    }
}
