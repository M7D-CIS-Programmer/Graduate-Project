/**
 * Central validation utility — bilingual (Arabic / English).
 *
 * Every function returns null when the value is valid, or a localised
 * error string when it is not.  Pass lang = 'ar' | 'en'.
 */

const msg = (ar, en, lang) => (lang === 'ar' ? ar : en);

// ── Primitives ────────────────────────────────────────────────────────────────

/** Checks that a value is not empty after trimming. */
export const required = (value, fieldLabel, lang = 'en') => {
    if (value === null || value === undefined || String(value).trim() === '') {
        return msg(
            `${fieldLabel || 'هذا الحقل'} مطلوب`,
            `${fieldLabel || 'This field'} is required`,
            lang
        );
    }
    return null;
};

// ── Email ─────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateEmail = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return msg('البريد الإلكتروني مطلوب', 'Email is required', lang);
    if (v.length > 254) return msg('البريد الإلكتروني طويل جداً', 'Email is too long', lang);
    if (!EMAIL_RE.test(v))
        return msg('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email address', lang);
    return null;
};

// ── Password ──────────────────────────────────────────────────────────────────

/**
 * Registration-strength password:
 *   • 8–72 chars
 *   • At least one uppercase letter
 *   • At least one digit
 */
export const validatePassword = (value, lang = 'en') => {
    const v = value || '';
    if (!v) return msg('كلمة المرور مطلوبة', 'Password is required', lang);
    if (v.length < 8)
        return msg('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل', 'Password must be at least 8 characters', lang);
    if (v.length > 72)
        return msg('كلمة المرور طويلة جداً (الحد الأقصى 72 حرفاً)', 'Password is too long (max 72 characters)', lang);
    if (!/[A-Z]/.test(v))
        return msg('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل', 'Password must contain at least one uppercase letter', lang);
    if (!/[0-9]/.test(v))
        return msg('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل', 'Password must contain at least one number', lang);
    return null;
};

/** Simple non-empty check — for login where we don't re-validate strength. */
export const validatePasswordLogin = (value, lang = 'en') => {
    if (!value) return msg('كلمة المرور مطلوبة', 'Password is required', lang);
    return null;
};

export const validateConfirmPassword = (password, confirm, lang = 'en') => {
    if (!confirm) return msg('يرجى تأكيد كلمة المرور', 'Please confirm your password', lang);
    if (password !== confirm) return msg('كلمتا المرور غير متطابقتين', 'Passwords do not match', lang);
    return null;
};

// ── Name ──────────────────────────────────────────────────────────────────────

export const validateName = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return msg('الاسم مطلوب', 'Name is required', lang);
    if (v.length < 2)
        return msg('يجب أن يتكون الاسم من حرفين على الأقل', 'Name must be at least 2 characters', lang);
    if (v.length > 100)
        return msg('الاسم طويل جداً (الحد الأقصى 100 حرف)', 'Name is too long (max 100 characters)', lang);
    if (/^\d+$/.test(v))
        return msg('الاسم لا يمكن أن يتكون من أرقام فقط', 'Name cannot contain only numbers', lang);
    return null;
};

// ── Phone ─────────────────────────────────────────────────────────────────────

// Allows +, digits, spaces, dashes, parentheses; digit count 7–15.
const PHONE_RE = /^[+\d][\d\s\-().]{5,19}$/;
const DIGITS_ONLY = (s) => s.replace(/\D/g, '');

export const validatePhone = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return null; // phone is optional
    if (!PHONE_RE.test(v))
        return msg('رقم الهاتف غير صحيح', 'Invalid phone number format', lang);
    const digits = DIGITS_ONLY(v);
    if (digits.length < 7)
        return msg('رقم الهاتف قصير جداً', 'Phone number is too short', lang);
    if (digits.length > 15)
        return msg('رقم الهاتف طويل جداً', 'Phone number is too long', lang);
    return null;
};

// ── URL ───────────────────────────────────────────────────────────────────────

export const validateUrl = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return null; // optional
    try {
        const url = new URL(v.startsWith('http') ? v : `https://${v}`);
        if (!['http:', 'https:'].includes(url.protocol))
            throw new Error();
        return null;
    } catch {
        return msg('يرجى إدخال رابط صحيح (مثال: https://example.com)', 'Please enter a valid URL (e.g. https://example.com)', lang);
    }
};

export const validateLinkedIn = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return null;
    const urlErr = validateUrl(v, lang);
    if (urlErr) return urlErr;
    const lower = v.toLowerCase();
    if (!lower.includes('linkedin.com'))
        return msg('يرجى إدخال رابط LinkedIn صحيح', 'Please enter a valid LinkedIn URL', lang);
    return null;
};

export const validateGitHub = (value, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return null;
    const urlErr = validateUrl(v, lang);
    if (urlErr) return urlErr;
    const lower = v.toLowerCase();
    if (!lower.includes('github.com'))
        return msg('يرجى إدخال رابط GitHub صحيح', 'Please enter a valid GitHub URL', lang);
    return null;
};

// ── Salary ────────────────────────────────────────────────────────────────────

export const validateSalary = (min, max, lang = 'en') => {
    const errors = {};
    const minN = min === '' || min === null || min === undefined ? null : Number(min);
    const maxN = max === '' || max === null || max === undefined ? null : Number(max);

    if (minN !== null) {
        if (isNaN(minN) || minN < 0)
            errors.salaryMin = msg('يجب أن يكون الراتب الأدنى رقماً موجباً', 'Minimum salary must be a positive number', lang);
        else if (minN > 1_000_000)
            errors.salaryMin = msg('الراتب الأدنى مرتفع جداً', 'Minimum salary is unrealistically high', lang);
    }

    if (maxN !== null) {
        if (isNaN(maxN) || maxN < 0)
            errors.salaryMax = msg('يجب أن يكون الراتب الأقصى رقماً موجباً', 'Maximum salary must be a positive number', lang);
        else if (maxN > 1_000_000)
            errors.salaryMax = msg('الراتب الأقصى مرتفع جداً', 'Maximum salary is unrealistically high', lang);
    }

    if (!errors.salaryMin && !errors.salaryMax && minN !== null && maxN !== null && minN > maxN) {
        errors.salaryMin = msg('يجب أن يكون الراتب الأدنى أقل من أو يساوي الأقصى', 'Minimum salary must be less than or equal to maximum', lang);
    }

    return errors; // {} means no errors
};

// ── Text / description fields ─────────────────────────────────────────────────

export const validateDescription = (value, label, min = 20, max = 5000, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return msg(`${label || 'هذا الحقل'} مطلوب`, `${label || 'This field'} is required`, lang);
    if (v.length < min)
        return msg(
            `يجب أن يكون ${label || 'هذا الحقل'} ${min} أحرف على الأقل`,
            `${label || 'This field'} must be at least ${min} characters`,
            lang
        );
    if (v.length > max)
        return msg(
            `${label || 'هذا الحقل'} طويل جداً (الحد الأقصى ${max} حرف)`,
            `${label || 'This field'} is too long (max ${max} characters)`,
            lang
        );
    return null;
};

export const validateShortText = (value, label, min = 2, max = 200, lang = 'en') => {
    const v = (value || '').trim();
    if (!v) return msg(`${label || 'هذا الحقل'} مطلوب`, `${label || 'This field'} is required`, lang);
    if (v.length < min)
        return msg(
            `${label || 'هذا الحقل'} قصير جداً (${min} أحرف على الأقل)`,
            `${label || 'This field'} is too short (min ${min} characters)`,
            lang
        );
    if (v.length > max)
        return msg(
            `${label || 'هذا الحقل'} طويل جداً (الحد الأقصى ${max} حرفاً)`,
            `${label || 'This field'} is too long (max ${max} characters)`,
            lang
        );
    return null;
};

// ── File uploads ──────────────────────────────────────────────────────────────

const PDF_TYPES = ['application/pdf'];

export const validateCvFile = (file, lang = 'en') => {
    if (!file) return msg('يرجى رفع ملف CV', 'Please upload your CV', lang);
    const isPdf = PDF_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return msg('يُقبل ملفات PDF فقط', 'Only PDF files are accepted', lang);
    if (file.size > 10 * 1024 * 1024)
        return msg('حجم الملف يتجاوز الحد المسموح (10 ميجابايت)', 'File size must not exceed 10 MB', lang);
    return null;
};

export const validateImageFile = (file, lang = 'en') => {
    if (!file) return null; // image upload is optional
    const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!IMAGE_TYPES.includes(file.type))
        return msg('يُقبل صور JPEG أو PNG أو WebP فقط', 'Only JPEG, PNG, or WebP images are accepted', lang);
    if (file.size > 5 * 1024 * 1024)
        return msg('حجم الصورة يتجاوز الحد المسموح (5 ميجابايت)', 'Image size must not exceed 5 MB', lang);
    return null;
};

// ── Security helpers ──────────────────────────────────────────────────────────

/** Strips obvious script injection patterns from a string. */
export const sanitize = (value) =>
    (value || '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, '')
                 .replace(/javascript:/gi, '')
                 .replace(/on\w+\s*=/gi, '');
