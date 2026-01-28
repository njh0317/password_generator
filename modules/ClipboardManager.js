/**
 * ClipboardManager Module
 * 
 * Handles copying passwords to the system clipboard.
 * Uses the Clipboard API with fallback to execCommand for older browsers.
 * 
 * Requirements: 4.1, 4.4
 */

export class ClipboardManager {
    constructor() {
        // No initialization needed
    }
    
    /**
     * Copy text to clipboard
     * Uses Clipboard API if available, falls back to execCommand
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copy(text) {
        // Validate input
        if (typeof text !== 'string') {
            return false;
        }
        
        // Try modern Clipboard API first
        if (this.isSupported()) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                // If Clipboard API fails, fall through to fallback
                console.warn('Clipboard API failed, trying fallback:', error);
            }
        }
        
        // Fallback to execCommand for older browsers
        return this._fallbackCopy(text);
    }
    
    /**
     * Fallback copy method using execCommand
     * @private
     * @param {string} text - Text to copy
     * @returns {boolean} - Success status
     */
    _fallbackCopy(text) {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        
        // Style it to be invisible and non-intrusive
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '2em';
        textarea.style.height = '2em';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';
        textarea.style.background = 'transparent';
        textarea.style.opacity = '0';
        
        // Add to DOM
        document.body.appendChild(textarea);
        
        // Select the text
        textarea.focus();
        textarea.select();
        
        let success = false;
        try {
            // Execute copy command
            success = document.execCommand('copy');
        } catch (error) {
            console.error('Fallback copy failed:', error);
            success = false;
        }
        
        // Clean up - remove the textarea
        document.body.removeChild(textarea);
        
        return success;
    }
    
    /**
     * Check if Clipboard API is supported
     * @returns {boolean} - Support status
     */
    isSupported() {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    }
}
