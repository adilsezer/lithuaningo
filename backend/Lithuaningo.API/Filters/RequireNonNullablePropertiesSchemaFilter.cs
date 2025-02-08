using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Lithuaningo.API.Filters
{
    public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema.Properties == null)
            {
                return;
            }

            foreach (var property in schema.Properties)
            {
                if (!property.Value.Nullable)
                {
                    if (schema.Required == null)
                    {
                        schema.Required = new HashSet<string>();
                    }
                    schema.Required.Add(property.Key);
                }
            }
        }
    }
} 