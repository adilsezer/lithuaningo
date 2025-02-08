using System;

namespace Lithuaningo.API.Utils
{
    public static class AnnouncementUtils
    {
        public static string GetAnnouncementStatus(bool isActive, DateTime? validUntil)
        {
            if (!isActive)
                return "inactive";
            if (validUntil.HasValue && validUntil.Value < DateTime.UtcNow)
                return "expired";
            return "active";
        }
    }
} 