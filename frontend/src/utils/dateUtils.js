/**
 * Formats a date string into a relative "time ago" string.
 * Supports both English and Arabic based on the provided t function and language.
 */
export const formatTimeAgo = (dateString, t, language = 'en') => {
    if (!dateString) return '';
    
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
        return t('justNow') || (language === 'ar' ? 'الآن' : 'Just now');
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return language === 'ar' 
            ? `منذ ${diffInMinutes} دقيقة` 
            : `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return language === 'ar' 
            ? `منذ ${diffInHours} ساعة` 
            : `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return t('oneDayAgo') || (language === 'ar' ? 'منذ يوم' : '1 day ago');
    }
    if (diffInDays === 2) {
        return t('twoDaysAgo') || (language === 'ar' ? 'منذ يومين' : '2 days ago');
    }
    if (diffInDays < 7) {
        return language === 'ar' 
            ? `منذ ${diffInDays} أيام` 
            : `${diffInDays} days ago`;
    }
    
    // Fallback to actual date
    return past.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Formats an ISO 8601 date string into a user-friendly localized format.
 * Example: "April 23, 2026, 2:41 AM" or "23 أبريل 2026، 2:41 ص"
 */
export const formatFriendlyDate = (dateString, language = 'en') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-JO' : 'en-US';
    
    return date.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(',', '،'); // Ensure Arabic comma if needed, though toLocaleString usually handles it.
};

