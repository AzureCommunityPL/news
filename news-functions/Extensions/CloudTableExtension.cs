using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace NewsFunctions.Extensions
{
    internal static class CloudTableExtension
    {
        public static async Task<T> Get<T>(this CloudTable table, string partitionKey, string rowKey) where T : ITableEntity, new()
        {
            var query = new TableQuery<T>().Where(
                TableQuery.CombineFilters(
                    TableQuery.GenerateFilterCondition(nameof(TableEntity.PartitionKey), QueryComparisons.Equal, partitionKey),
                    TableOperators.And,
                    TableQuery.GenerateFilterCondition(nameof(TableEntity.RowKey), QueryComparisons.Equal, rowKey))).Take(1);

            var result = new T();
            TableContinuationToken continuationToken = null;
            do
            {
               var segment = await table.ExecuteQuerySegmentedAsync(query, continuationToken);
                result = segment.FirstOrDefault();
                continuationToken = segment.ContinuationToken;
            } while (continuationToken != null);
            return result;
        }
    }
}
