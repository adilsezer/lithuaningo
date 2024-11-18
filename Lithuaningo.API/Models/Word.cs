public class Word
{
    public string Id { get; set; }
    public List<WordForm> WordForms { get; set; }
    public string EnglishTranslation { get; set; }
    public string ImageUrl { get; set; }
    public string AdditionalInfo { get; set; }
}

public class WordForm
{
    public string Lithuanian { get; set; }
    public string English { get; set; }
}