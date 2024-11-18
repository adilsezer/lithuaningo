public class UserProfile
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public bool EmailVerified { get; set; }
    public List<string> LearnedSentences { get; set; } = new List<string>();
}