using System;
using Services.Quiz.Generators;
using Services.Quiz.Interfaces;

public class QuestionGeneratorFactory : IQuestionGeneratorFactory
{
    private readonly IWordService _wordService;
    private readonly ISentenceService _sentenceService;

    public QuestionGeneratorFactory(
        IWordService wordService,
        ISentenceService sentenceService)
    {
        _wordService = wordService;
        _sentenceService = sentenceService;
    }

    public IQuestionGenerator Create(QuestionType type)
    {
        return type switch
        {
            QuestionType.MultipleChoice => new MultipleChoiceQuestionGenerator(_wordService, _sentenceService),
            QuestionType.FillInTheBlank => new FillInBlankQuestionGenerator(_wordService),
            QuestionType.TrueFalse => new TrueFalseQuestionGenerator(_wordService),
            QuestionType.ReorderWords => new ReorderWordsQuestionGenerator(_wordService),
            _ => throw new ArgumentException($"Unsupported question type: {type}")
        };
    }
}
