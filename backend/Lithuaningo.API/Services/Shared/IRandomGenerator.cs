namespace Lithuaningo.API.Services.Shared
{
    public interface IRandomGenerator
    {
        int Next(int maxValue);
        int Next(int minValue, int maxValue);
    }
}