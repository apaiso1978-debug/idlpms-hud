/**
 * IDLPMS Validators - Utility Functions for Validation
 * =====================================================
 * Comprehensive validation functions for:
 * - Basic data type checks
 * - Thai-specific validations (Citizen ID, phone, etc.)
 * - Form field validations
 * - Role and permission validations
 * - Educational data validations
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// BASIC VALIDATORS
// ============================================================================

/**
 * Check if value is null or undefined
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isNullOrUndefined(value) {
    return value === null || value === undefined;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isEmpty(value) {
    if (isNullOrUndefined(value)) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Check if value is not empty
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isNotEmpty(value) {
    return !isEmpty(value);
}

/**
 * Check if value is a valid string
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isString(value) {
    return typeof value === 'string';
}

/**
 * Check if value is a valid number
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is an integer
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isInteger(value) {
    return isNumber(value) && Number.isInteger(value);
}

/**
 * Check if value is a positive number
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isPositive(value) {
    return isNumber(value) && value > 0;
}

/**
 * Check if value is a valid boolean
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}

/**
 * Check if value is a valid array
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isArray(value) {
    return Array.isArray(value);
}

/**
 * Check if value is a valid object (not null, not array)
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a valid function
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof value === 'function';
}

// ============================================================================
// STRING VALIDATORS
// ============================================================================

/**
 * Check if string has minimum length
 * @param {string} value - String to check
 * @param {number} minLength - Minimum length
 * @returns {boolean}
 */
function hasMinLength(value, minLength) {
    if (!isString(value)) return false;
    return value.length >= minLength;
}

/**
 * Check if string has maximum length
 * @param {string} value - String to check
 * @param {number} maxLength - Maximum length
 * @returns {boolean}
 */
function hasMaxLength(value, maxLength) {
    if (!isString(value)) return false;
    return value.length <= maxLength;
}

/**
 * Check if string length is within range
 * @param {string} value - String to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean}
 */
function hasLengthBetween(value, min, max) {
    return hasMinLength(value, min) && hasMaxLength(value, max);
}

/**
 * Check if string contains only alphanumeric characters
 * @param {string} value - String to check
 * @returns {boolean}
 */
function isAlphanumeric(value) {
    if (!isString(value)) return false;
    return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Check if string contains only alphabetic characters
 * @param {string} value - String to check
 * @returns {boolean}
 */
function isAlphabetic(value) {
    if (!isString(value)) return false;
    return /^[a-zA-Z]+$/.test(value);
}

/**
 * Check if string contains Thai characters
 * @param {string} value - String to check
 * @returns {boolean}
 */
function containsThai(value) {
    if (!isString(value)) return false;
    return /[\u0E00-\u0E7F]/.test(value);
}

/**
 * Check if string contains only Thai characters and spaces
 * @param {string} value - String to check
 * @returns {boolean}
 */
function isThaiOnly(value) {
    if (!isString(value)) return false;
    return /^[\u0E00-\u0E7F\s]+$/.test(value);
}

/**
 * Check if string contains only Thai or English characters and spaces
 * @param {string} value - String to check
 * @returns {boolean}
 */
function isThaiOrEnglish(value) {
    if (!isString(value)) return false;
    return /^[\u0E00-\u0E7Fa-zA-Z\s]+$/.test(value);
}

/**
 * Check if string matches a pattern
 * @param {string} value - String to check
 * @param {RegExp} pattern - Regex pattern
 * @returns {boolean}
 */
function matchesPattern(value, pattern) {
    if (!isString(value)) return false;
    return pattern.test(value);
}

// ============================================================================
// THAI-SPECIFIC VALIDATORS
// ============================================================================

/**
 * Validate Thai Citizen ID (เลขบัตรประชาชน 13 หลัก)
 * @param {string} citizenId - Citizen ID to validate
 * @returns {boolean}
 */
function isValidThaiCitizenId(citizenId) {
    if (!isString(citizenId)) return false;

    // Remove any spaces or dashes
    const cleanId = citizenId.replace(/[\s-]/g, '');

    // Must be exactly 13 digits
    if (!/^\d{13}$/.test(cleanId)) return false;

    // Checksum validation using Modulo 11 algorithm
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanId[i]) * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(cleanId[12]);
}

/**
 * Validate Thai phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidThaiPhone(phone) {
    if (!isString(phone)) return false;

    // Remove spaces, dashes, and country code prefix
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^\+66/, '0');

    // Thai mobile: 08x, 09x (10 digits)
    // Thai landline: 02, 03, 04, 05, 07 (9 digits)
    const mobilePattern = /^0[689]\d{8}$/;
    const landlinePattern = /^0[2-57]\d{7}$/;

    return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
}

/**
 * Validate Thai mobile phone number specifically
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidThaiMobile(phone) {
    if (!isString(phone)) return false;
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^\+66/, '0');
    return /^0[689]\d{8}$/.test(cleanPhone);
}

/**
 * Validate Thai postal code (รหัสไปรษณีย์)
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean}
 */
function isValidThaiPostalCode(postalCode) {
    if (!isString(postalCode)) return false;
    return /^\d{5}$/.test(postalCode.trim());
}

/**
 * Format Thai phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatThaiPhone(phone) {
    if (!isString(phone)) return '';
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^\+66/, '0');

    if (cleanPhone.length === 10) {
        // Mobile: 0xx-xxx-xxxx
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleanPhone.length === 9) {
        // Landline: 0x-xxx-xxxx
        return cleanPhone.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
}

/**
 * Format Thai Citizen ID for display
 * @param {string} citizenId - Citizen ID to format
 * @returns {string} Formatted citizen ID
 */
function formatThaiCitizenId(citizenId) {
    if (!isString(citizenId)) return '';
    const cleanId = citizenId.replace(/[\s-]/g, '');

    if (cleanId.length !== 13) return citizenId;

    // Format: x-xxxx-xxxxx-xx-x
    return cleanId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
}

// ============================================================================
// EMAIL AND URL VALIDATORS
// ============================================================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    if (!isString(email)) return false;

    // RFC 5322 compliant email regex (simplified)
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailPattern.test(email.trim());
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
    if (!isString(url)) return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// DATE VALIDATORS
// ============================================================================

/**
 * Check if value is a valid Date object
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if date string is valid (YYYY-MM-DD format)
 * @param {string} dateString - Date string to validate
 * @returns {boolean}
 */
function isValidDateString(dateString) {
    if (!isString(dateString)) return false;

    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(dateString)) return false;

    const date = new Date(dateString);
    return isValidDate(date);
}

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isDateInPast(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValidDate(dateObj)) return false;
    return dateObj < new Date();
}

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isDateInFuture(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValidDate(dateObj)) return false;
    return dateObj > new Date();
}

/**
 * Check if date is within range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start of range
 * @param {Date|string} endDate - End of range
 * @returns {boolean}
 */
function isDateInRange(date, startDate, endDate) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (!isValidDate(dateObj) || !isValidDate(start) || !isValidDate(end)) {
        return false;
    }

    return dateObj >= start && dateObj <= end;
}

/**
 * Validate age (must be between min and max years old)
 * @param {Date|string} birthDate - Birth date
 * @param {number} minAge - Minimum age
 * @param {number} maxAge - Maximum age
 * @returns {boolean}
 */
function isValidAge(birthDate, minAge = 0, maxAge = 150) {
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (!isValidDate(birth)) return false;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age >= minAge && age <= maxAge;
}

/**
 * Validate Thai Buddhist year (พ.ศ.)
 * @param {number|string} buddhistYear - Buddhist year to validate
 * @returns {boolean}
 */
function isValidBuddhistYear(buddhistYear) {
    const year = parseInt(buddhistYear);
    if (!isInteger(year)) return false;

    // Buddhist year is 543 years ahead of Gregorian
    // Valid range: 2400-2700 (approximately 1857-2157 CE)
    return year >= 2400 && year <= 2700;
}

/**
 * Convert Buddhist year to Gregorian year
 * @param {number|string} buddhistYear - Buddhist year
 * @returns {number}
 */
function buddhistToGregorian(buddhistYear) {
    return parseInt(buddhistYear) - 543;
}

/**
 * Convert Gregorian year to Buddhist year
 * @param {number|string} gregorianYear - Gregorian year
 * @returns {number}
 */
function gregorianToBuddhist(gregorianYear) {
    return parseInt(gregorianYear) + 543;
}

// ============================================================================
// EDUCATIONAL DATA VALIDATORS
// ============================================================================

/**
 * Valid IDLPMS roles
 */
const VALID_ROLES = ['STUDENT', 'PARENT', 'TEACHER', 'SCHOOL_DIR', 'ESA_DIR', 'OBEC', 'MOE'];

/**
 * Valid subjects (กลุ่มสาระการเรียนรู้)
 */
const VALID_SUBJECTS = ['THAI', 'MATH', 'SCI', 'SOC', 'HIST', 'PE', 'ARTS', 'CAREERS', 'ENG'];

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
function isValidRole(role) {
    return isString(role) && VALID_ROLES.includes(role.toUpperCase());
}

/**
 * Validate subject code
 * @param {string} subject - Subject code to validate
 * @returns {boolean}
 */
function isValidSubject(subject) {
    return isString(subject) && VALID_SUBJECTS.includes(subject.toUpperCase());
}

/**
 * Validate grade/score (0-100)
 * @param {number} grade - Grade to validate
 * @returns {boolean}
 */
function isValidGrade(grade) {
    return isNumber(grade) && grade >= 0 && grade <= 100;
}

/**
 * Validate GPA (0.00-4.00)
 * @param {number} gpa - GPA to validate
 * @returns {boolean}
 */
function isValidGPA(gpa) {
    return isNumber(gpa) && gpa >= 0 && gpa <= 4;
}

/**
 * Convert score to grade level (Thai system)
 * @param {number} score - Score (0-100)
 * @returns {object} Grade information
 */
function scoreToGrade(score) {
    if (!isValidGrade(score)) return null;

    if (score >= 80) return { grade: 4, letter: 'A', description: 'ดีเยี่ยม' };
    if (score >= 75) return { grade: 3.5, letter: 'B+', description: 'ดีมาก' };
    if (score >= 70) return { grade: 3, letter: 'B', description: 'ดี' };
    if (score >= 65) return { grade: 2.5, letter: 'C+', description: 'ค่อนข้างดี' };
    if (score >= 60) return { grade: 2, letter: 'C', description: 'ปานกลาง' };
    if (score >= 55) return { grade: 1.5, letter: 'D+', description: 'พอใช้' };
    if (score >= 50) return { grade: 1, letter: 'D', description: 'ผ่าน' };
    return { grade: 0, letter: 'F', description: 'ไม่ผ่าน' };
}

/**
 * Validate education level (ระดับชั้น)
 * @param {string} level - Education level to validate
 * @returns {boolean}
 */
function isValidEducationLevel(level) {
    if (!isString(level)) return false;

    // Valid levels: ป.1-6, ม.1-6, อ.1-3
    const validPatterns = [
        /^ป\.[1-6]$/,   // ประถมศึกษา
        /^ม\.[1-6]$/,   // มัธยมศึกษา
        /^อ\.[1-3]$/,   // อนุบาล
        /^P[1-6]$/i,    // Primary (English)
        /^M[1-6]$/i,    // Secondary (English)
        /^K[1-3]$/i     // Kindergarten (English)
    ];

    return validPatterns.some(pattern => pattern.test(level));
}

/**
 * Validate class/section format
 * @param {string} classSection - Class section to validate (e.g., "6/1", "ป.6/1")
 * @returns {boolean}
 */
function isValidClassSection(classSection) {
    if (!isString(classSection)) return false;

    // Format: level/section (e.g., "6/1", "ป.6/1", "M3/2")
    return /^(ป\.|ม\.|อ\.|[PMK])?[1-6]\/[1-9]\d*$/i.test(classSection);
}

/**
 * Validate school year (ปีการศึกษา)
 * @param {number|string} year - School year (Buddhist year)
 * @returns {boolean}
 */
function isValidSchoolYear(year) {
    const yearNum = parseInt(year);
    if (!isInteger(yearNum)) return false;

    // Valid range: 2540-2600 (approximately 1997-2057 CE)
    return yearNum >= 2540 && yearNum <= 2600;
}

/**
 * Validate semester
 * @param {number|string} semester - Semester to validate
 * @returns {boolean}
 */
function isValidSemester(semester) {
    const sem = parseInt(semester);
    return sem === 1 || sem === 2;
}

/**
 * Validate attendance status
 * @param {string} status - Attendance status
 * @returns {boolean}
 */
function isValidAttendanceStatus(status) {
    const validStatuses = ['present', 'absent', 'late', 'excused', 'sick', 'leave'];
    return isString(status) && validStatuses.includes(status.toLowerCase());
}

// ============================================================================
// ID FORMAT VALIDATORS
// ============================================================================

/**
 * Validate IDLPMS user ID format
 * @param {string} userId - User ID to validate
 * @returns {boolean}
 */
function isValidUserId(userId) {
    if (!isString(userId)) return false;

    // Format: PREFIX_NNN (e.g., STU_001, TEA_001, MOE_001)
    const pattern = /^(STU|PAR|TEA|SCH_DIR|ESA_DIR|OBEC|MOE)(_HS)?_\d{3,}$/;
    return pattern.test(userId);
}

/**
 * Validate IDLPMS school ID format
 * @param {string} schoolId - School ID to validate
 * @returns {boolean}
 */
function isValidSchoolId(schoolId) {
    if (!isString(schoolId)) return false;

    // Format: SCH_NNN (e.g., SCH_001)
    return /^SCH_\d{3,}$/.test(schoolId);
}

/**
 * Validate IDLPMS ESA ID format
 * @param {string} esaId - ESA ID to validate
 * @returns {boolean}
 */
function isValidEsaId(esaId) {
    if (!isString(esaId)) return false;

    // Format: ESA_NN (e.g., ESA_01)
    return /^ESA_\d{2,}$/.test(esaId);
}

/**
 * Validate IDLPMS subject ID format
 * @param {string} subjectId - Subject ID to validate
 * @returns {boolean}
 */
function isValidSubjectId(subjectId) {
    if (!isString(subjectId)) return false;

    // Format: SUB_XXX (e.g., SUB_THAI, SUB_MATH)
    return /^SUB_[A-Z]+$/.test(subjectId);
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Create a validation result object
 * @param {boolean} isValid - Whether validation passed
 * @param {string} message - Error message if invalid
 * @returns {object}
 */
function createValidationResult(isValid, message = '') {
    return {
        isValid,
        message: isValid ? '' : message
    };
}

/**
 * Validate a field with multiple rules
 * @param {any} value - Value to validate
 * @param {array} rules - Array of validation rules
 * @returns {object} Validation result
 */
function validateField(value, rules) {
    for (const rule of rules) {
        const result = rule(value);
        if (!result.isValid) {
            return result;
        }
    }
    return createValidationResult(true);
}

/**
 * Create a required field validator
 * @param {string} fieldName - Name of the field for error message
 * @returns {function}
 */
function required(fieldName = 'ฟิลด์นี้') {
    return (value) => createValidationResult(
        isNotEmpty(value),
        `${fieldName}จำเป็นต้องกรอก`
    );
}

/**
 * Create a min length validator
 * @param {number} min - Minimum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {function}
 */
function minLength(min, fieldName = 'ข้อความ') {
    return (value) => createValidationResult(
        hasMinLength(value || '', min),
        `${fieldName}ต้องมีความยาวอย่างน้อย ${min} ตัวอักษร`
    );
}

/**
 * Create a max length validator
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {function}
 */
function maxLength(max, fieldName = 'ข้อความ') {
    return (value) => createValidationResult(
        hasMaxLength(value || '', max),
        `${fieldName}ต้องมีความยาวไม่เกิน ${max} ตัวอักษร`
    );
}

/**
 * Create an email validator
 * @returns {function}
 */
function email() {
    return (value) => createValidationResult(
        isEmpty(value) || isValidEmail(value),
        'รูปแบบอีเมลไม่ถูกต้อง'
    );
}

/**
 * Create a Thai phone validator
 * @returns {function}
 */
function thaiPhone() {
    return (value) => createValidationResult(
        isEmpty(value) || isValidThaiPhone(value),
        'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
    );
}

/**
 * Create a Thai citizen ID validator
 * @returns {function}
 */
function thaiCitizenId() {
    return (value) => createValidationResult(
        isEmpty(value) || isValidThaiCitizenId(value),
        'เลขบัตรประชาชนไม่ถูกต้อง'
    );
}

/**
 * Validate an entire form
 * @param {object} formData - Form data object
 * @param {object} validationSchema - Schema with field names and rules
 * @returns {object} Validation results for all fields
 */
function validateForm(formData, validationSchema) {
    const results = {
        isValid: true,
        errors: {}
    };

    for (const [fieldName, rules] of Object.entries(validationSchema)) {
        const value = formData[fieldName];
        const fieldResult = validateField(value, rules);

        if (!fieldResult.isValid) {
            results.isValid = false;
            results.errors[fieldName] = fieldResult.message;
        }
    }

    return results;
}

// ============================================================================
// PERMISSION VALIDATORS
// ============================================================================

/**
 * Check if role can access another role's data
 * @param {string} accessorRole - Role attempting to access
 * @param {string} targetRole - Role being accessed
 * @returns {boolean}
 */
function canRoleAccessRole(accessorRole, targetRole) {
    const roleLevel = {
        'STUDENT': 1,
        'PARENT': 2,
        'TEACHER': 3,
        'SCHOOL_DIR': 4,
        'ESA_DIR': 5,
        'OBEC': 6,
        'MOE': 7
    };

    const accessorLevel = roleLevel[accessorRole] || 0;
    const targetLevel = roleLevel[targetRole] || 0;

    // Higher level roles can access lower level roles
    return accessorLevel >= targetLevel;
}

/**
 * Check if user can perform action based on role
 * @param {string} role - User's role
 * @param {string} action - Action to perform
 * @returns {boolean}
 */
function canPerformAction(role, action) {
    const rolePermissions = {
        'STUDENT': ['view_own_grades', 'view_curriculum', 'submit_homework', 'chat'],
        'PARENT': ['view_child_grades', 'view_child_attendance', 'chat', 'view_reports'],
        'TEACHER': ['view_class', 'edit_grades', 'edit_attendance', 'create_lessons', 'chat'],
        'SCHOOL_DIR': ['view_school', 'manage_teachers', 'view_reports', 'approve_requests'],
        'ESA_DIR': ['view_esa', 'manage_schools', 'view_reports', 'policy'],
        'OBEC': ['view_all', 'manage_esa', 'national_reports', 'policy'],
        'MOE': ['everything']
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes('everything') || permissions.includes(action);
}

// ============================================================================
// EXPORTS
// ============================================================================

// For browser
if (typeof window !== 'undefined') {
    window.Validators = {
        // Basic
        isNullOrUndefined,
        isEmpty,
        isNotEmpty,
        isString,
        isNumber,
        isInteger,
        isPositive,
        isBoolean,
        isArray,
        isObject,
        isFunction,

        // String
        hasMinLength,
        hasMaxLength,
        hasLengthBetween,
        isAlphanumeric,
        isAlphabetic,
        containsThai,
        isThaiOnly,
        isThaiOrEnglish,
        matchesPattern,

        // Thai-specific
        isValidThaiCitizenId,
        isValidThaiPhone,
        isValidThaiMobile,
        isValidThaiPostalCode,
        formatThai
