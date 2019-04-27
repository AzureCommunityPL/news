using System;
using System.Collections.Generic;
using System.Text;

namespace news_functions
{
    internal static class EnvironmentHelper
    {
        internal static string GetEnv(string name)
        {
            return Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.Process) ??
                   throw new ArgumentException($"{nameof(name)}: {name}");
        }
    }
}
