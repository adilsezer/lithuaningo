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

        // ===== Grammatical Categories =====
        /// <summary>
        /// Words that describe actions (e.g., eiti, kalbėti, valgyti)
        /// </summary>
        Verb = 0,

        /// <summary>
        /// Words that name people, places, things (e.g., namas, šalis, žmogus)
        /// </summary>
        Noun = 1,

        /// <summary>
        /// Words that describe nouns (e.g., gražus, didelis, mažas)
        /// </summary>
        Adjective = 2,

        /// <summary>
        /// Words that modify verbs, adjectives or other adverbs (e.g., greitai, labai)
        /// </summary>
        Adverb = 3,

        /// <summary>
        /// Words that replace nouns (e.g., aš, tu, jis, ji)
        /// </summary>
        Pronoun = 4,

        /// <summary>
        /// Prepositions and conjunctions
        /// </summary>
        Connector = 5,

        // ===== Thematic Categories =====
        /// <summary>
        /// Common expressions used in greeting (e.g., labas, sveiki)
        /// </summary>
        Greeting = 100,

        /// <summary>
        /// Common useful phrases (e.g., atsiprašau, prašom, ačiū)
        /// </summary>
        Phrase = 101,

        /// <summary>
        /// Numbers and counting words
        /// </summary>
        Number = 102,

        /// <summary>
        /// Words related to time (e.g., vakar, šiandien, rytoj)
        /// </summary>
        TimeWord = 103,

        /// <summary>
        /// Words related to food and dining
        /// </summary>
        Food = 104,

        /// <summary>
        /// Words related to travel
        /// </summary>
        Travel = 105,

        /// <summary>
        /// Family-related terms
        /// </summary>
        Family = 106,

        /// <summary>
        /// Work and profession related terms
        /// </summary>
        Work = 107,

        /// <summary>
        /// Weather and nature related terms
        /// </summary>
        Nature = 108,
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
    }
}