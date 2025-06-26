using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Difficulty levels for flashcards
    /// </summary>
    public enum DifficultyLevel
    {
        /// <summary>
        /// Basic vocabulary and grammar
        /// </summary>
        Basic = 0,

        /// <summary>
        /// Intermediate vocabulary and grammar
        /// </summary>
        Intermediate = 1,

        /// <summary>
        /// Advanced vocabulary and grammar
        /// </summary>
        Advanced = 2
    }

    /// <summary>
    /// Categories for flashcards representing different types of language elements
    /// </summary>
    public enum FlashcardCategory
    {
        /// <summary>
        /// Special value to indicate that flashcards from all categories should be returned
        /// </summary>
        AllCategories = -1,

        // ===== Grammatical Categories (starting from 1000 to avoid overlap) =====
        /// <summary>
        /// Words that describe actions (e.g., eiti, kalbėti, valgyti)
        /// </summary>
        Verb = 1000,

        /// <summary>
        /// Words that name people, places, things (e.g., namas, šalis, žmogus)
        /// </summary>
        Noun = 1001,

        /// <summary>
        /// Words that describe nouns (e.g., gražus, didelis, mažas)
        /// </summary>
        Adjective = 1002,

        /// <summary>
        /// Words that modify verbs, adjectives or other adverbs (e.g., greitai, labai)
        /// </summary>
        Adverb = 1003,

        /// <summary>
        /// Words that replace nouns (e.g., aš, tu, jis, ji)
        /// </summary>
        Pronoun = 1004,

        /// <summary>
        /// Prepositions and conjunctions
        /// </summary>
        Connector = 1005,

        // ===== Thematic Categories (starting from 2000) =====
        /// <summary>
        /// Common expressions used in greeting (e.g., labas, sveiki)
        /// </summary>
        Greeting = 2000,

        /// <summary>
        /// Common useful phrases (e.g., atsiprašau, prašom, ačiū)
        /// </summary>
        Phrase = 2001,

        /// <summary>
        /// Numbers and counting words
        /// </summary>
        Number = 2002,

        /// <summary>
        /// Words related to time (e.g., vakar, šiandien, rytoj)
        /// </summary>
        TimeWord = 2003,

        /// <summary>
        /// Words related to food and dining
        /// </summary>
        Food = 2004,

        /// <summary>
        /// Words related to travel
        /// </summary>
        Travel = 2005,

        /// <summary>
        /// Family-related terms
        /// </summary>
        Family = 2006,

        /// <summary>
        /// Work and profession related terms
        /// </summary>
        Work = 2007,

        /// <summary>
        /// Weather and nature related terms
        /// </summary>
        Nature = 2008,
    }

    /// <summary>
    /// Request for flashcard operations (generation and retrieval)
    /// </summary>
    public class FlashcardRequest
    {
        /// <summary>
        /// Primary category for the flashcards - this is the main organizing principle
        /// </summary>
        /// <remarks>
        /// This is required and specifies what type of flashcards to generate.
        /// Can be a grammatical category (Noun, Verb) or thematic category (Food, Travel).
        /// The AI will generate flashcards that fit this category.
        /// </remarks>
        [Required]
        public FlashcardCategory PrimaryCategory { get; set; } = FlashcardCategory.AllCategories;

        /// <summary>
        /// Number of flashcards to return (1-50)
        /// </summary>
        [Range(1, 50)]
        public int Count { get; set; } = 10;

        /// <summary>
        /// Optional user ID for development/testing. If not provided, uses the authenticated user's ID.
        /// </summary>
        public string? UserId { get; set; }

        /// <summary>
        /// The difficulty level of flashcards to generate
        /// </summary>
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Basic;

        /// <summary>
        /// Whether to automatically generate images for new flashcards (default: true)
        /// </summary>
        public bool GenerateImages { get; set; } = true;

        /// <summary>
        /// Whether to automatically generate audio for new flashcards (default: true)
        /// </summary>
        public bool GenerateAudio { get; set; } = true;
    }
}