/**
 * HistoryManager Module
 * 
 * Manages password history with FIFO queue behavior.
 * Stores recently generated passwords in memory (and optionally in localStorage).
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */

export class HistoryManager {
    constructor(maxSize = 10, useLocalStorage = true) {
        this.maxSize = maxSize;
        this.useLocalStorage = useLocalStorage;
        this.storageKey = 'password-history';
        this.history = [];
        
        // Load history from localStorage if available
        if (this.useLocalStorage) {
            this._loadFromStorage();
        }
    }
    
    /**
     * Add password to history with FIFO queue behavior
     * @param {string} password - Password to add
     */
    add(password) {
        if (!password || typeof password !== 'string') {
            return;
        }
        
        // Add to the end of the array (most recent)
        this.history.push(password);
        
        // Remove oldest entries if exceeding max size (FIFO behavior)
        while (this.history.length > this.maxSize) {
            this.history.shift(); // Remove from the beginning (oldest)
        }
        
        // Persist to localStorage if enabled
        if (this.useLocalStorage) {
            this._saveToStorage();
        }
    }
    
    /**
     * Get all passwords from history
     * @returns {string[]} - Array of passwords (oldest to newest)
     */
    getAll() {
        return [...this.history]; // Return a copy to prevent external modification
    }
    
    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        
        // Clear from localStorage if enabled
        if (this.useLocalStorage) {
            this._clearStorage();
        }
    }
    
    /**
     * Get maximum history size
     * @returns {number} - Maximum size
     */
    getMaxSize() {
        return this.maxSize;
    }
    
    /**
     * Load history from localStorage
     * @private
     */
    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    this.history = parsed.slice(-this.maxSize); // Only keep up to maxSize entries
                }
            }
        } catch (error) {
            // localStorage unavailable or data corrupted, continue with empty history
            console.warn('Failed to load history from localStorage:', error);
            this.history = [];
        }
    }
    
    /**
     * Save history to localStorage
     * @private
     */
    _saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            // localStorage unavailable (e.g., private browsing, quota exceeded)
            console.warn('Failed to save history to localStorage:', error);
        }
    }
    
    /**
     * Clear history from localStorage
     * @private
     */
    _clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear history from localStorage:', error);
        }
    }
}
