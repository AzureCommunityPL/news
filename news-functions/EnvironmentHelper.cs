using System;

namespace news_functions
{
    internal static class EnvironmentHelper
    {
        internal static string GetEnv(string name)
        {
            return GetEnvironmentVariable(name) ?? 
                   GetEnvironmentVariable($"CUSTOMCONNSTR_{name}") ??
                   GetEnvironmentVariable($"MYSQLCONNSTR_{name}") ??
                   GetEnvironmentVariable($"SQLCONNSTR_{name}") ??
                   GetEnvironmentVariable($"SQLAZURECONNSTR_{name}") ??
                   throw new ArgumentException($"{nameof(name)}: {name}");
        }

        private static string GetEnvironmentVariable(string name)
        {
            return Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.Process);
        }
    }
}
