using System;
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

        /// <summary>
        /// Given a week ID in "YYYY-WW" format, returns the start and end dates for that week.
        /// </summary>
        /// <param name="weekId">The week period in "YYYY-WW" format.</param>
        /// <returns>A tuple containing the start date and end date of the week.</returns>
        /// <exception cref="ArgumentException">Thrown if the weekId is not in the expected format.</exception>
        public static (DateTime startDate, DateTime endDate) GetWeekDates(string weekId)
        {
            var parts = weekId.Split('-');
            if (parts.Length != 2 || !int.TryParse(parts[0], out var year) || !int.TryParse(parts[1], out var week))
            {
                throw new ArgumentException("Invalid week ID format. Expected YYYY-WW", nameof(weekId));
            }

            // ISO 8601: the week containing January 4th is the first week.
            var jan4 = new DateTime(year, 1, 4);
            // Calculate the Monday of the first ISO week.
            // ISOWeek class defines Monday as the first day.
            var firstMonday = jan4.AddDays(-(int)jan4.DayOfWeek + (int)DayOfWeek.Monday);
            // If jan4 is Sunday, DayOfWeek returns 0; in that case, adjust to the next Monday.
            if (jan4.DayOfWeek == DayOfWeek.Sunday)
            {
                firstMonday = jan4.AddDays(1);
            }
            var weekStart = firstMonday.AddDays((week - 1) * 7);
            var weekEnd = weekStart.AddDays(6);
            return (weekStart, weekEnd);
        }
    }
}
