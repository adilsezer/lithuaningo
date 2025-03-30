using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using Lithuaningo.API.DTOs.Flashcard;
using System.Collections.Generic;

namespace Lithuaningo.API.Models
{
    [Table("flashcards")]
    public class Flashcard : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("front_word")]
        public string FrontWord { get; set; } = string.Empty;

        [Column("back_word")]
        public string BackWord { get; set; } = string.Empty;

        [Column("example_sentence")]
        public string ExampleSentence { get; set; } = string.Empty;

        [Column("example_sentence_translation")]
        public string ExampleSentenceTranslation { get; set; } = string.Empty;

        [Column("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [Column("audio_url")]
        public string AudioUrl { get; set; } = string.Empty;

        [Column("notes")]
        public string Notes { get; set; } = string.Empty;

        [Column("categories")]
        public List<int> Categories { get; set; } = new();

        [Column("difficulty")]
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Basic;
    }
}
