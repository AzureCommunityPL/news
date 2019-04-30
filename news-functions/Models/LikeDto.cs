using System;

namespace NewsFunctions.Models
{
    public class LikeDto
    {
        public DateTime PostDate { get; set; }
        public string PostId { get; set; }
        public string FbUserId { get; set; }
    }
}