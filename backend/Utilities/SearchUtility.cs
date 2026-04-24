using System.Text.RegularExpressions;
using System.Text;

namespace aabu_project.Utilities;

public static class SearchUtility
{
    private static readonly Dictionary<string, string> TranslationMap = new(StringComparer.OrdinalIgnoreCase)
    {
        // Jobs & Roles
        { "developer", "مطور" },
        { "programmer", "مبرمج" },
        { "manager", "مدير" },
        { "engineer", "مهندس" },
        { "design", "تصميم" },
        { "designer", "مصمم" },
        { "marketing", "تسويق" },
        { "sales", "مبيعات" },
        { "accounting", "محاسبة" },
        { "admin", "ادمن" },
        { "administration", "ادارة" },
        { "teacher", "معلم" },
        { "nurse", "ممرض" },
        { "doctor", "طبيب" },
        { "technician", "فني" },
        { "support", "دعم" },
        { "customer", "عملاء" },
        { "front", "امامي" },
        { "back", "خلفي" },
        { "full", "كامل" },
        { "stack", "ستاك" },
        
        // Industries
        { "technology", "تكنولوجيا" },
        { "finance", "تمويل" },
        { "health", "صحة" },
        { "education", "تعليم" },
        { "industrial", "صناعي" },
        
        // Cities / Locations (Transliteration equivalents)
        { "dubai", "دبي" },
        { "abu dhabi", "ابو ظبي" },
        { "sharjah", "الشارقة" },
        { "amman", "عمان" },
        { "cairo", "القاهرة" },
        { "riyadh", "الرياض" },
        { "jeddah", "جدة" },
        { "remote", "عن بعد" },
        { "hybrid", "هجين" }
    };

    // Reverse map for Arabic to English
    private static readonly Dictionary<string, string> ReverseMap = TranslationMap.ToDictionary(x => x.Value, x => x.Key);

    public static string Normalize(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        // 1. To lower and trim
        text = text.Trim().ToLower();

        // 2. Arabic Normalization (Alif variants, Teh Marbuta, etc.)
        text = Regex.Replace(text, "[أإآ]", "ا");
        text = Regex.Replace(text, "ة", "ه");
        text = Regex.Replace(text, "ى", "ي");
        text = Regex.Replace(text, "ئ", "ء");
        text = Regex.Replace(text, "ؤ", "ء");
        
        // 3. Remove Diacritics (Harakat)
        text = Regex.Replace(text, "[\u064B-\u065F]", "");

        // 4. Remove special characters
        text = Regex.Replace(text, @"[^a-zA-Z0-9\u0621-\u064A\s]", "");

        return text;
    }

    public static bool IsArabic(string text)
    {
        return Regex.IsMatch(text, @"[\u0600-\u06FF]");
    }

    public static string GetEquivalent(string word)
    {
        var normalized = Normalize(word);
        
        if (TranslationMap.TryGetValue(normalized, out var ar)) return ar;
        if (ReverseMap.TryGetValue(normalized, out var en)) return en;
        
        return normalized;
    }

    public static string GenerateSearchKey(params string?[] fields)
    {
        var sb = new StringBuilder();
        foreach (var field in fields)
        {
            if (string.IsNullOrEmpty(field)) continue;
            
            var normalized = Normalize(field);
            sb.Append(normalized).Append(" ");
            
            // Add equivalents for each word
            var words = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in words)
            {
                var eq = GetEquivalent(word);
                if (eq != word)
                {
                    sb.Append(eq).Append(" ");
                }
            }
        }
        return sb.ToString().Trim();
    }
}
