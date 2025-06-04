namespace Lithuaningo.API.DTOs.Challenge;

/// <summary>
/// Response containing information about when the next daily challenge becomes available
/// </summary>
public class NextChallengeTimeResponse
{
    /// <summary>
    /// The current server time in UTC
    /// </summary>
    public DateTime CurrentTimeUtc { get; set; }

    /// <summary>
    /// When the next daily challenge becomes available (00:00 UTC tomorrow)
    /// </summary>
    public DateTime NextChallengeTimeUtc { get; set; }

    /// <summary>
    /// Number of seconds until the next challenge becomes available
    /// </summary>
    public long SecondsUntilNext { get; set; }

    /// <summary>
    /// Whether a new challenge is already available (happens when it's past midnight UTC)
    /// </summary>
    public bool IsNewChallengeAvailable { get; set; }
}