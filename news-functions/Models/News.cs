using System;

namespace NewsFunctions.Models
{
    public class News
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Summary { get; set; }
        public DateTime Date { get; set; }
    }
}