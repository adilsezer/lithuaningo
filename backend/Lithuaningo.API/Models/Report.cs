using Google.Cloud.Firestore;
using System;

namespace Lithuaningo.API.Models
{
    [FirestoreData]
    public class Report
    {
        [FirestoreDocumentId]
        public string? Id { get; set; }

        [FirestoreProperty("contentType")]
        public string ContentType { get; set; } = string.Empty; // "deck" or "flashcard"

        [FirestoreProperty("contentId")]
        public string ContentId { get; set; } = string.Empty;

        [FirestoreProperty("reason")]
        public string Reason { get; set; } = string.Empty;

        [FirestoreProperty("details")]
        public string Details { get; set; } = string.Empty;

        [FirestoreProperty("reportedBy")]
        public string ReportedBy { get; set; } = string.Empty;

        [FirestoreProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty("status")]
        public string Status { get; set; } = "pending"; // pending, reviewed, resolved, rejected

        [FirestoreProperty("reviewedBy")]
        public string? ReviewedBy { get; set; }

        [FirestoreProperty("reviewedAt")]
        public DateTime? ReviewedAt { get; set; }

        [FirestoreProperty("resolution")]
        public string? Resolution { get; set; }
    }
} 