using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using NewsFunctions.Models;
using Newtonsoft.Json;

namespace NewsFunctions.Helpers
{
    internal static class FacebookTokenValidation
    {
        public const string AccessToken = "access_token";
        private static HttpClient _httpClient = new HttpClient();

        public static async Task<FacebookProfileDto> IsTokenValid(StringValues token, CancellationToken cancellationToken)
        {
            var graphResponse = await _httpClient.SendAsync(new HttpRequestMessage()
            {
                RequestUri = new Uri("https://graph.facebook.com/v3.3/me?fields=id,name"),
                Method = HttpMethod.Get,
                Headers = { { "Authorization", $"Bearer {token.ToString()}" } }
            }, cancellationToken);

            graphResponse.EnsureSuccessStatusCode();

            var graphContent = await graphResponse.Content.ReadAsStringAsync();

            var fbProfile = JsonConvert.DeserializeObject<FacebookProfileDto>(graphContent);

            return fbProfile;
        }
    }
}
