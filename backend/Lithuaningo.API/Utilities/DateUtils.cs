using System.Globalization;

namespace Lithuaningo.API.Utilities
{
    public static class DateUtils
    {
        /// <summary>
        /// Returns the current week period in "YYYY-WW" format using ISO 8601 week numbering.
        /// </summary>
        public static string GetCurrentWeekPeriod()
        {
            var now = DateTime.UtcNow;
            var weekNumber = ISOWeek.GetWeekOfYear(now);
            return $"{now.Year}-{weekNumber:D2}";
        }
    }
}
