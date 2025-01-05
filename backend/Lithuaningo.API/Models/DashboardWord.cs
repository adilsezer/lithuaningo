namespace Lithuaningo.API.Models
{
    public class DashboardWord
    {
        public string Lemma { get; set; } = string.Empty;
        public string PartOfSpeech { get; set; } = string.Empty;
        public string Ipa { get; set; } = string.Empty;
        public string EnglishTranslation { get; set; } = string.Empty;
        public string SentenceUsage { get; set; } = string.Empty;
    }
}