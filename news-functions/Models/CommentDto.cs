using System;

namespace NewsFunctions.Models
{
    public class CommentDto
    {
        public DateTime PostDateTime { get; set; }
        public Guid PostId { get; set; }
        public string Comment { get; set; }
        public string Title { get; set; }

    }
}