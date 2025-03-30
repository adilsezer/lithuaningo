using Microsoft.Extensions.DependencyInjection;
using System;

namespace Lithuaningo.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Register Random as a singleton to ensure thread safety
            services.AddSingleton<Random>(sp => new Random());

            return services;
        }
    }
} 