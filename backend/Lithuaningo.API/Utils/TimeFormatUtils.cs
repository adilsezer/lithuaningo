using System;

namespace Lithuaningo.API.Utils
{
    public static class TimeFormatUtils
    {
        public static string GetTimeAgo(DateTime dateTime)
        {
            var span = DateTime.UtcNow - dateTime;
            
            if (span.TotalDays > 365)
                return $"{(int)(span.TotalDays / 365)}y ago";
            if (span.TotalDays > 30)
                return $"{(int)(span.TotalDays / 30)}mo ago";
            if (span.TotalDays > 1)
                return $"{(int)span.TotalDays}d ago";
            if (span.TotalHours > 1)
                return $"{(int)span.TotalHours}h ago";
            if (span.TotalMinutes > 1)
                return $"{(int)span.TotalMinutes}m ago";
            
            return "just now";
        }

        public static string? GetTimeRemaining(DateTime validUntil)
        {
            if (validUntil < DateTime.UtcNow)
                return null;
                
            var span = validUntil - DateTime.UtcNow;
            
            if (span.TotalDays > 1)
                return $"{(int)span.TotalDays} days";
            if (span.TotalHours > 1)
                return $"{(int)span.TotalHours} hours";
            if (span.TotalMinutes > 1)
                return $"{(int)span.TotalMinutes} minutes";
            
            return "expiring soon";
        }
    }
} 