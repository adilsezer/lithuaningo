using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Quiz.Factory;
using Lithuaningo.API.Services.Quiz.Interfaces;
using Lithuaningo.API.Utilities;

namespace Lithuaningo.API.Services.Quiz;

public class QuizService : IQuizService
{
    private readonly IUserService _userService;
    private readonly IWordService _wordService;
    private readonly IQuestionGeneratorFactory _questionGeneratorFactory;
    private readonly IRandomGenerator _randomGenerator;

    public QuizService(
        IUserService userService,
        IWordService wordService,
        IQuestionGeneratorFactory questionGeneratorFactory,
        IRandomGenerator randomGenerator)
    {
        _userService = userService;
        _wordService = wordService;
        _questionGeneratorFactory = questionGeneratorFactory;
        _randomGenerator = randomGenerator;
    }

    public async Task<List<QuizQuestion>> GenerateQuizAsync(string userId)
    {
        // Dummy implementation that uses Task.FromResult to properly handle async
        return await Task.FromResult(new List<QuizQuestion>());
    }
}