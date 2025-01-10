using Google.Cloud.Firestore;

namespace Lithuaningo.API.Models
{
    public class TimestampConverter : IFirestoreConverter<DateTime>
    {
        public object ToFirestore(DateTime value) => Timestamp.FromDateTime(value.ToUniversalTime());

        public DateTime FromFirestore(object value)
        {
            if (value is Timestamp timestamp)
                return timestamp.ToDateTime();
            return DateTime.MinValue;
        }
    }
} 