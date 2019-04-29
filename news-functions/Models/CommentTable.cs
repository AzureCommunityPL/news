using Microsoft.WindowsAzure.Storage.Table;

namespace news_functions.Models
{
    public class CommentTable : TableEntity
    {
        public string Comment { get; set; }
        public string Title { get; set; }
    }
}