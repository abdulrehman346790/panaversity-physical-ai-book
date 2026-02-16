/**
 * Translation Validation Utilities
 * Validates translation JSON structure and ensures code blocks are preserved
 */

import { TECHNICAL_WHITELIST } from './technicalTerms';

/**
 * Validate translation file structure
 * @param {Object} translation - Translation object to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array<string> }
 */
export function validateTranslation(translation) {
  const errors = [];

  if (!translation) {
    errors.push('Translation object is null or undefined');
    return { valid: false, errors };
  }

  // Check required fields
  if (!translation.chapter_id) {
    errors.push('Missing required field: chapter_id');
  }

  if (!translation.language) {
    errors.push('Missing required field: language');
  } else if (translation.language !== 'urdu') {
    errors.push(`Invalid language: ${translation.language} (must be 'urdu')`);
  }

  if (!translation.title) {
    errors.push('Missing required field: title');
  }

  if (!translation.content) {
    errors.push('Missing required field: content');
  } else if (typeof translation.content !== 'string') {
    errors.push('Content must be a string');
  }

  if (!translation.translation_status) {
    errors.push('Missing required field: translation_status');
  } else if (!['complete', 'pending', 'unavailable'].includes(translation.translation_status)) {
    errors.push(
      `Invalid translation_status: ${translation.translation_status}`
    );
  }

  if (!translation.last_updated) {
    errors.push('Missing required field: last_updated');
  } else if (!/^\d{4}-\d{2}-\d{2}T/.test(translation.last_updated)) {
    errors.push('Invalid ISO 8601 timestamp in last_updated');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if content contains code blocks
 * @param {string} htmlContent - HTML content to check
 * @returns {boolean} True if code blocks detected
 */
export function hasCodeBlocks(htmlContent) {
  if (!htmlContent) return false;
  return /<(pre|code)[\s>]/.test(htmlContent);
}

/**
 * Validate that code blocks in translation are not translated
 * Checks that code keywords remain in English
 * @param {string} htmlContent - HTML content to validate
 * @param {Array<string>} codePatterns - Common code keywords to check
 * @returns {Object} Validation result { valid: boolean, issues: Array<string> }
 */
export function validateCodeBlocksPreserved(
  htmlContent,
  codePatterns = ['import', 'def', 'class', 'function', 'return', 'for', 'while']
) {
  const issues = [];

  if (!hasCodeBlocks(htmlContent)) {
    return { valid: true, issues: [] };
  }

  // Extract code blocks from HTML
  const codeBlockRegex = /<pre[^>]*>[\s\S]*?<\/pre>/g;
  const codeBlocks = htmlContent.match(codeBlockRegex) || [];

  for (const block of codeBlocks) {
    // Check if common code keywords are present (indicating code is intact)
    const hasKeywords = codePatterns.some((pattern) => block.includes(pattern));

    if (!hasKeywords) {
      // This might be okay - code could use different keywords
      // But warn if block looks suspiciously short or wrong
      const codeContent = block.replace(/<[^>]*>/g, '').trim();
      if (codeContent.length < 10) {
        issues.push('Code block appears to be empty or corrupted');
      }
    }

    // Check for common Urdu Unicode patterns in code blocks
    if (/[\u0600-\u06FF]/.test(block)) {
      issues.push('Urdu text detected in code block (code should not be translated)');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Sanitize translation HTML to prevent XSS
 * Removes dangerous elements while preserving formatting
 * @param {string} htmlContent - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeTranslationHTML(htmlContent) {
  if (!htmlContent) return '';

  // Remove script tags and event handlers
  let sanitized = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove dangerous elements
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta', 'style'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}[^>]*>[\s\S]*?<\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  return sanitized;
}

/**
 * Check translation completeness
 * Verifies that content is not empty and has reasonable structure
 * @param {Object} translation - Translation object
 * @returns {Object} Completeness check { complete: boolean, metrics: Object }
 */
export function checkTranslationCompleteness(translation) {
  if (!translation) {
    return {
      complete: false,
      metrics: {
        hasTitle: false,
        hasContent: false,
        contentLength: 0,
        hasSections: false,
        sectionCount: 0,
      },
    };
  }

  const contentLength = translation.content?.length || 0;
  const hasSections = Array.isArray(translation.sections) && translation.sections.length > 0;
  const sectionCount = translation.sections?.length || 0;

  return {
    complete:
      translation.title &&
      contentLength > 100 &&
      translation.translation_status === 'complete',
    metrics: {
      hasTitle: Boolean(translation.title),
      hasContent: Boolean(translation.content),
      contentLength,
      hasSections,
      sectionCount,
    },
  };
}

/**
 * Validate whitelist application
 * Checks that major technical terms were not translated
 * @param {string} htmlContent - HTML content to check
 * @returns {Object} Validation result { applied: boolean, preservedTerms: Array<string> }
 */
export function validateWhitelistApplication(htmlContent) {
  if (!htmlContent) {
    return { applied: false, preservedTerms: [] };
  }

  const preservedTerms = [];

  for (const item of TECHNICAL_WHITELIST.slice(0, 10)) {
    // Check first 10 terms
    if (htmlContent.includes(item.term)) {
      preservedTerms.push(item.term);
    }
  }

  return {
    applied: preservedTerms.length >= 3,
    preservedTerms,
  };
}
