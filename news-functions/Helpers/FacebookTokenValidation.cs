using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;

namespace NewsFunctions.Helpers
{
    internal static class FacebookTokenValidation
    {
        public const string AccessToken = "access_token";
        private static HttpClient _httpClient = new HttpClient();

        public static async Task<bool> IsTokenValid(StringValues token)
        {
            var status = await _httpClient.GetAsync(new Uri($"https://graph.facebook.com/me?access_token={token}"));

            return status.IsSuccessStatusCode;
        }
    }
}
