using Newtonsoft.Json.Linq;

namespace Lithuaningo.API.Extensions
{
    public static class SupabaseExtensions
    {
        public static T? GetProperty<T>(this object model, string propertyName) where T : class
        {
            if (model == null) return null;
            
            var jObject = JObject.FromObject(model);
            var property = jObject[propertyName];
            
            return property?.ToObject<T>();
        }
    }
} 