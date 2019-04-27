using Microsoft.WindowsAzure.Storage.Table;

namespace news_functions
{
    public class NewsTable : TableEntity
    {
        public string Title { get; set; }
        public string Url { get; set; }
        public string Summary { get; set; }
    }
}