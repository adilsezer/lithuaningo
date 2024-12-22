namespace Lithuaningo.API.Utilities
{
    public static class TextUtilities
    {
        public static List<string> GetSanitizedWords(string text)
        {
            return text.Split(' ')
                       .Select(word => word.TrimEnd('.', ',', '!', '?', ';', ':', '(', ')', '[', ']',
                                                  '{', '}', '\'', '\"', '`', '~', '^', '*', '_', '+',
                                                  '-', '=', '/', '\\', '|', '<', '>', ' '))
                       .Where(word => !IsExcludedWord(word))
                       .ToList();
        }

        public static double GetLevenshteinSimilarity(string word1, string word2)
        {
            if (string.IsNullOrEmpty(word1) || string.IsNullOrEmpty(word2))
                return string.IsNullOrEmpty(word1) && string.IsNullOrEmpty(word2) ? 1.0 : 0.0;

            int len1 = word1.Length;
            int len2 = word2.Length;
            int[,] distances = new int[len1 + 1, len2 + 1];

            for (int i = 0; i <= len1; i++) distances[i, 0] = i;
            for (int j = 0; j <= len2; j++) distances[0, j] = j;

            for (int i = 1; i <= len1; i++)
            {
                for (int j = 1; j <= len2; j++)
                {
                    int cost = word1[i - 1] == word2[j - 1] ? 0 : 1;
                    distances[i, j] = Math.Min(
                        Math.Min(distances[i - 1, j] + 1, distances[i, j - 1] + 1),
                        distances[i - 1, j - 1] + cost
                    );
                }
            }

            int levenshteinDistance = distances[len1, len2];
            int maxLength = Math.Max(len1, len2);

            return maxLength == 0 ? 1.0 : 1.0 - (double)levenshteinDistance / maxLength;
        }

        public static bool IsExcludedWord(string word)
        {
            var excludedWords = new List<string> { "yra", "Aš", "aš", "buvo", "Mano", "ir", "tu", "jis", "ji", "mes", "jie", "jos", "tai", "į" };
            return excludedWords.Contains(word);
        }
    }
}