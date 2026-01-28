/**
 * PasswordGenerator Module
 * 
 * Generates cryptographically secure random passwords based on user configuration.
 * Uses the Web Crypto API (window.crypto.getRandomValues()) for secure randomness.
 */

export class PasswordGenerator {
    constructor() {
        // Character set constants
        this.UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
        this.NUMBERS = '0123456789';
        this.DEFAULT_SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.SPACE = ' ';
        this.SIMILAR_CHARS = 'lI1O0';
    }
    
    /**
     * Generate passwords based on configuration
     * @param {Object} config - Password generation configuration
     * @param {number} config.length - Password length (4-64)
     * @param {boolean} config.includeUppercase - Include uppercase letters
     * @param {boolean} config.includeLowercase - Include lowercase letters
     * @param {boolean} config.includeNumbers - Include numbers
     * @param {boolean} config.includeSpecialChars - Include special characters
     * @param {string} [config.customSpecialChars] - Custom special characters
     * @param {boolean} config.excludeSimilar - Exclude similar characters
     * @param {boolean} config.allowDuplicates - Allow duplicate characters
     * @param {boolean} config.includeSpaces - Include space character
     * @param {number} [config.count=1] - Number of passwords to generate
     * @returns {string[]} - Array of generated passwords
     */
    generate(config) {
        const count = config.count || 1;
        const passwords = [];
        
        for (let i = 0; i < count; i++) {
            passwords.push(this.generateSingle(config));
        }
        
        return passwords;
    }
    
    /**
     * Generate a single password based on configuration
     * @param {Object} config - Password generation configuration
     * @returns {string} - Generated password
     * @private
     */
    generateSingle(config) {
        const characterSet = this.getCharacterSet(config);
        
        // Validate that we have characters to work with
        if (characterSet.length === 0) {
            throw new Error('No character types selected');
        }
        
        // Check if we can generate a password without duplicates
        if (!config.allowDuplicates && config.length > characterSet.length) {
            throw new Error(`Cannot generate password of length ${config.length} without duplicates. Only ${characterSet.length} unique characters available.`);
        }
        
        // Build separate character sets for each enabled type
        const enabledTypes = this.getEnabledCharacterTypes(config);
        
        let password = [];
        
        // Ensure at least one character from each enabled type
        if (enabledTypes.length > 0) {
            for (const typeCharSet of enabledTypes) {
                const char = this.getRandomCharacter(typeCharSet);
                password.push(char);
            }
        }
        
        // Fill remaining positions with random characters from full set
        const remainingLength = config.length - password.length;
        for (let i = 0; i < remainingLength; i++) {
            let char;
            if (!config.allowDuplicates) {
                // Find a character not already in the password
                char = this.getUniqueRandomCharacter(characterSet, password);
            } else {
                char = this.getRandomCharacter(characterSet);
            }
            password.push(char);
        }
        
        // Shuffle the password using Fisher-Yates algorithm with crypto random values
        password = this.shuffleArray(password);
        
        return password.join('');
    }
    
    /**
     * Get character sets for each enabled character type
     * @param {Object} config - Password generation configuration
     * @returns {string[]} - Array of character sets for each enabled type
     * @private
     */
    getEnabledCharacterTypes(config) {
        const types = [];
        
        if (config.includeUppercase) {
            let uppercase = this.UPPERCASE;
            if (config.excludeSimilar) {
                uppercase = this.excludeSimilarCharacters(uppercase);
            }
            if (uppercase.length > 0) {
                types.push(uppercase);
            }
        }
        
        if (config.includeLowercase) {
            let lowercase = this.LOWERCASE;
            if (config.excludeSimilar) {
                lowercase = this.excludeSimilarCharacters(lowercase);
            }
            if (lowercase.length > 0) {
                types.push(lowercase);
            }
        }
        
        if (config.includeNumbers) {
            let numbers = this.NUMBERS;
            if (config.excludeSimilar) {
                numbers = this.excludeSimilarCharacters(numbers);
            }
            if (numbers.length > 0) {
                types.push(numbers);
            }
        }
        
        if (config.includeSpecialChars) {
            let special = config.customSpecialChars && config.customSpecialChars.length > 0
                ? config.customSpecialChars
                : this.DEFAULT_SPECIAL;
            if (config.excludeSimilar) {
                special = this.excludeSimilarCharacters(special);
            }
            if (special.length > 0) {
                types.push(special);
            }
        }
        
        if (config.includeSpaces) {
            types.push(this.SPACE);
        }
        
        return types;
    }
    
    /**
     * Get a random character from a character set using crypto API
     * @param {string} characterSet - The character set to choose from
     * @returns {string} - A random character
     * @private
     */
    getRandomCharacter(characterSet) {
        const randomIndex = this.getSecureRandomInt(characterSet.length);
        return characterSet[randomIndex];
    }
    
    /**
     * Get a unique random character not already in the password
     * @param {string} characterSet - The character set to choose from
     * @param {string[]} existingChars - Characters already in the password
     * @returns {string} - A unique random character
     * @private
     */
    getUniqueRandomCharacter(characterSet, existingChars) {
        const availableChars = characterSet.split('').filter(char => !existingChars.includes(char));
        
        if (availableChars.length === 0) {
            throw new Error('No unique characters available');
        }
        
        const randomIndex = this.getSecureRandomInt(availableChars.length);
        return availableChars[randomIndex];
    }
    
    /**
     * Generate a cryptographically secure random integer between 0 (inclusive) and max (exclusive)
     * @param {number} max - The upper bound (exclusive)
     * @returns {number} - A random integer
     * @private
     */
    getSecureRandomInt(max) {
        // Use rejection sampling to avoid modulo bias
        const randomBuffer = new Uint32Array(1);
        const range = Math.floor(0xFFFFFFFF / max) * max;
        
        let randomValue;
        do {
            window.crypto.getRandomValues(randomBuffer);
            randomValue = randomBuffer[0];
        } while (randomValue >= range);
        
        return randomValue % max;
    }
    
    /**
     * Shuffle an array using Fisher-Yates algorithm with crypto random values
     * @param {Array} array - The array to shuffle
     * @returns {Array} - The shuffled array
     * @private
     */
    shuffleArray(array) {
        const shuffled = [...array];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.getSecureRandomInt(i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }
    
    /**
     * Build character set from configuration
     * @param {Object} config - Password generation configuration
     * @param {boolean} config.includeUppercase - Include uppercase letters
     * @param {boolean} config.includeLowercase - Include lowercase letters
     * @param {boolean} config.includeNumbers - Include numbers
     * @param {boolean} config.includeSpecialChars - Include special characters
     * @param {string} [config.customSpecialChars] - Custom special characters (overrides default)
     * @param {boolean} config.excludeSimilar - Exclude similar characters (l, I, 1, O, 0)
     * @param {boolean} config.includeSpaces - Include space character
     * @returns {string} - Character set string
     */
    getCharacterSet(config) {
        let characterSet = '';
        
        // Build base character set from enabled options
        if (config.includeUppercase) {
            characterSet += this.UPPERCASE;
        }
        
        if (config.includeLowercase) {
            characterSet += this.LOWERCASE;
        }
        
        if (config.includeNumbers) {
            characterSet += this.NUMBERS;
        }
        
        if (config.includeSpecialChars) {
            // Use custom special characters if provided, otherwise use default
            if (config.customSpecialChars && config.customSpecialChars.length > 0) {
                characterSet += config.customSpecialChars;
            } else {
                characterSet += this.DEFAULT_SPECIAL;
            }
        }
        
        if (config.includeSpaces) {
            characterSet += this.SPACE;
        }
        
        // Apply similar character exclusion if enabled
        if (config.excludeSimilar) {
            characterSet = this.excludeSimilarCharacters(characterSet);
        }
        
        return characterSet;
    }
    
    /**
     * Remove similar characters from a character set
     * @param {string} characterSet - The character set to filter
     * @returns {string} - Filtered character set without similar characters
     * @private
     */
    excludeSimilarCharacters(characterSet) {
        let filtered = '';
        for (let i = 0; i < characterSet.length; i++) {
            const char = characterSet[i];
            if (!this.SIMILAR_CHARS.includes(char)) {
                filtered += char;
            }
        }
        return filtered;
    }
}
