using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Quiz.Interfaces;

public interface IQuizService
{
    Task<List<QuizQuestion>> GenerateQuizAsync(string userId);
} 