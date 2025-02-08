using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Word;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Mappings.Resolvers
{
    public class LemmaWordResolver : IValueResolver<WordForm, WordFormResponse, string>
    {
        private readonly IWordService _wordService;
        
        public LemmaWordResolver(IWordService wordService)
        {
            _wordService = wordService;
        }
        
        public string Resolve(WordForm source, WordFormResponse destination, string destMember, ResolutionContext context)
        {
            var lemma = _wordService.GetLemma(source.Word).Result;
            return lemma?.Word ?? string.Empty;
        }
    }
} 