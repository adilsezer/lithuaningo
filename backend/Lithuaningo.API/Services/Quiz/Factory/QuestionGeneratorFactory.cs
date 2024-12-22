using System;
using Services.Quiz.Generators;
using Services.Quiz.Interfaces;

public class QuestionGeneratorFactory : IQuestionGeneratorFactory
{
    private readonly IWordService _wordService;
    private readonly ISentenceService _sentenceService;
    private readonly IRandomGenerator _randomGenerator;

    public QuestionGeneratorFactory(
        IWordService wordService,
        ISentenceService sentenceService,
        IRandomGenerator randomGenerator)
    {
        _wordService = wordService;
        _sentenceService = sentenceService;
        _randomGenerator = randomGenerator;
    }

    public IQuestionGenerator Create(QuestionType type)
    {
        return type switch
        {
            QuestionType.MultipleChoice => new MultipleChoiceQuestionGenerator(_wordService, _sentenceService, _randomGenerator),
            QuestionType.FillInTheBlank => new FillInBlankQuestionGenerator(_wordService, _randomGenerator),
            QuestionType.TrueFalse => new TrueFalseQuestionGenerator(_wordService, _randomGenerator),
            QuestionType.ReorderWords => new ReorderWordsQuestionGenerator(_wordService, _randomGenerator),
            _ => throw new ArgumentException($"Unsupported question type: {type}")
        };
    }
}
