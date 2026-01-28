/**
 * StrengthMeter Module
 * 
 * Evaluates password strength using multiple security heuristics:
 * - Length analysis (0-30 points)
 * - Character variety (0-30 points)
 * - Pattern detection (0-20 points) - sequential, repeated characters
 * - Dictionary checking (0-20 points) - against common passwords
 * 
 * Total score: 0-100 points
 * Strength levels: Very Weak (0-20), Weak (21-40), Medium (41-60), Strong (61-80), Very Strong (81-100)
 */

// Top 1000 most common passwords for dictionary checking
const COMMON_PASSWORDS = [
    'password', '123456', '123456789', '12345678', '12345', '1234567', 'password1',
    '123123', '1234567890', '000000', 'abc123', '1234', 'iloveyou', '1q2w3e4r',
    'qwerty', 'monkey', 'dragon', '111111', 'letmein', 'baseball', 'shadow',
    'master', '666666', 'qwertyuiop', '123321', 'mustang', '1234567891', 'michael',
    '654321', 'superman', '1qaz2wsx', '7777777', 'fuckyou', '121212', 'welcome',
    'jesus', 'ninja', 'mustang', 'password123', 'adobe123', 'admin', 'trustno1',
    'solo', 'sunshine', 'photoshop', 'starwars', 'qazwsx', 'hello', 'freedom',
    'whatever', 'charlie', 'aa123456', 'donald', 'qwerty123', 'zaq1zaq1', 'pass',
    'football', 'batman', 'maggie', 'pepper', 'princess', 'jordan', 'liverpool',
    'michelle', 'bailey', 'cheese', 'sophie', 'summer', 'ashley', 'nicole',
    'chelsea', 'biteme', 'matthew', 'access', 'yankees', '987654321', 'dallas',
    'austin', 'thunder', 'taylor', 'matrix', 'william', 'corvette', 'hello123',
    'martin', 'heather', 'secret', 'merlin', 'diamond', '1234qwer', 'ginger',
    'computer', 'michelle', 'jessica', 'pepper', 'tigger', 'cookie', 'jennifer',
    'thomas', 'joshua', 'samantha', 'hunter', 'killer', 'soccer', 'harley',
    'ranger', 'jordan23', 'asshole', 'fuckme', 'daniel', 'andrew', 'martin',
    'samsung', 'master', 'jordan', 'asdfgh', 'andrea', 'claire', 'lovely',
    'jessica', 'melissa', 'jasmine', 'brandon', 'purple', 'hannah', 'banana',
    'robert', 'thomas', 'hockey', 'forever', 'angela', 'nathan', 'samsung1',
    'test', 'test123', 'demo', 'demo123', 'user', 'user123', 'root', 'toor',
    'pass123', 'default', 'guest', 'changeme', 'temp', 'temp123', 'sample',
    'example', 'qwerty1', 'azerty', 'mypass', 'mypassword', 'letmein123'
];

export const StrengthLevel = {
    VERY_WEAK: 0,
    WEAK: 1,
    MEDIUM: 2,
    STRONG: 3,
    VERY_STRONG: 4
};

export class StrengthMeter {
    constructor() {
        this.commonPasswords = new Set(COMMON_PASSWORDS);
    }
    
    /**
     * Evaluate password strength
     * @param {string} password - Password to evaluate
     * @returns {Object} - Strength result with level, score, and feedback
     */
    evaluate(password) {
        if (!password || typeof password !== 'string') {
            return this._createResult(0, StrengthLevel.VERY_WEAK, ['Password is required']);
        }

        const lengthScore = this._evaluateLength(password);
        const varietyScore = this._evaluateCharacterVariety(password);
        const patternScore = this._evaluatePatterns(password);
        const dictionaryScore = this._evaluateDictionary(password);

        const totalScore = lengthScore + varietyScore + patternScore + dictionaryScore;
        const level = this._mapScoreToLevel(totalScore);
        const feedback = this._generateFeedback(password, lengthScore, varietyScore, patternScore, dictionaryScore);

        return {
            level,
            score: totalScore,
            lengthScore,
            varietyScore,
            patternScore,
            dictionaryScore,
            feedback,
            color: this._getColorForLevel(level),
            label: this._getLabelForLevel(level)
        };
    }

    /**
     * Evaluate length score (0-30 points)
     * < 8 chars: 0 points
     * 8-11 chars: 10 points
     * 12-15 chars: 20 points
     * 16+ chars: 30 points
     */
    _evaluateLength(password) {
        const length = password.length;
        if (length < 8) return 0;
        if (length <= 11) return 10;
        if (length <= 15) return 20;
        return 30;
    }

    /**
     * Evaluate character variety score (0-30 points)
     * Has lowercase: +7 points
     * Has uppercase: +7 points
     * Has numbers: +8 points
     * Has special chars: +8 points
     */
    _evaluateCharacterVariety(password) {
        let score = 0;
        
        if (/[a-z]/.test(password)) score += 7;
        if (/[A-Z]/.test(password)) score += 7;
        if (/[0-9]/.test(password)) score += 8;
        if (/[^a-zA-Z0-9]/.test(password)) score += 8;
        
        return score;
    }

    /**
     * Evaluate pattern score (0-20 points)
     * No sequential characters: +10 points
     * No repeated characters: +10 points
     */
    _evaluatePatterns(password) {
        let score = 20;
        
        // Check for sequential characters (abc, 123, xyz, etc.)
        if (this._hasSequentialCharacters(password)) {
            score -= 10;
        }
        
        // Check for repeated characters (aaa, 111, etc.)
        if (this._hasRepeatedCharacters(password)) {
            score -= 10;
        }
        
        return score;
    }

    /**
     * Check for sequential characters (abc, 123, xyz, etc.)
     */
    _hasSequentialCharacters(password) {
        for (let i = 0; i < password.length - 2; i++) {
            const char1 = password.charCodeAt(i);
            const char2 = password.charCodeAt(i + 1);
            const char3 = password.charCodeAt(i + 2);
            
            // Check for ascending sequence
            if (char2 === char1 + 1 && char3 === char2 + 1) {
                return true;
            }
            
            // Check for descending sequence
            if (char2 === char1 - 1 && char3 === char2 - 1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check for repeated characters (aaa, 111, etc.)
     */
    _hasRepeatedCharacters(password) {
        for (let i = 0; i < password.length - 2; i++) {
            if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Evaluate dictionary score (0-20 points)
     * Not a common password: +20 points
     * Is a common password: 0 points
     */
    _evaluateDictionary(password) {
        const lowerPassword = password.toLowerCase();
        
        // Check exact match
        if (this.commonPasswords.has(lowerPassword)) {
            return 0;
        }
        
        // Check if password contains a common password as substring
        for (const commonPass of this.commonPasswords) {
            if (commonPass.length >= 4 && lowerPassword.includes(commonPass)) {
                return 0;
            }
        }
        
        return 20;
    }

    /**
     * Map total score to strength level
     * 0-20: Very Weak
     * 21-40: Weak
     * 41-60: Medium
     * 61-80: Strong
     * 81-100: Very Strong
     */
    _mapScoreToLevel(score) {
        if (score <= 20) return StrengthLevel.VERY_WEAK;
        if (score <= 40) return StrengthLevel.WEAK;
        if (score <= 60) return StrengthLevel.MEDIUM;
        if (score <= 80) return StrengthLevel.STRONG;
        return StrengthLevel.VERY_STRONG;
    }

    /**
     * Generate feedback suggestions for improvement
     */
    _generateFeedback(password, lengthScore, varietyScore, patternScore, dictionaryScore) {
        const feedback = [];
        
        if (lengthScore < 30) {
            if (password.length < 8) {
                feedback.push('Password is too short. Use at least 8 characters.');
            } else if (password.length < 12) {
                feedback.push('Consider using 12 or more characters for better security.');
            } else if (password.length < 16) {
                feedback.push('Good length. Consider 16+ characters for maximum security.');
            }
        }
        
        if (varietyScore < 30) {
            const missing = [];
            if (!/[a-z]/.test(password)) missing.push('lowercase letters');
            if (!/[A-Z]/.test(password)) missing.push('uppercase letters');
            if (!/[0-9]/.test(password)) missing.push('numbers');
            if (!/[^a-zA-Z0-9]/.test(password)) missing.push('special characters');
            
            if (missing.length > 0) {
                feedback.push(`Add ${missing.join(', ')} for better variety.`);
            }
        }
        
        if (patternScore < 20) {
            if (this._hasSequentialCharacters(password)) {
                feedback.push('Avoid sequential characters (abc, 123, etc.).');
            }
            if (this._hasRepeatedCharacters(password)) {
                feedback.push('Avoid repeated characters (aaa, 111, etc.).');
            }
        }
        
        if (dictionaryScore === 0) {
            feedback.push('This is a common password. Use something more unique.');
        }
        
        if (feedback.length === 0) {
            feedback.push('Excellent password strength!');
        }
        
        return feedback;
    }

    /**
     * Get color for strength level
     */
    _getColorForLevel(level) {
        const colors = {
            [StrengthLevel.VERY_WEAK]: '#dc3545',  // red
            [StrengthLevel.WEAK]: '#fd7e14',       // orange
            [StrengthLevel.MEDIUM]: '#ffc107',     // yellow
            [StrengthLevel.STRONG]: '#90ee90',     // light green
            [StrengthLevel.VERY_STRONG]: '#28a745' // dark green
        };
        return colors[level] || '#6c757d';
    }

    /**
     * Get label for strength level
     */
    _getLabelForLevel(level) {
        const labels = {
            [StrengthLevel.VERY_WEAK]: 'Very Weak',
            [StrengthLevel.WEAK]: 'Weak',
            [StrengthLevel.MEDIUM]: 'Medium',
            [StrengthLevel.STRONG]: 'Strong',
            [StrengthLevel.VERY_STRONG]: 'Very Strong'
        };
        return labels[level] || 'Unknown';
    }

    /**
     * Helper to create result object
     */
    _createResult(score, level, feedback) {
        return {
            level,
            score,
            lengthScore: 0,
            varietyScore: 0,
            patternScore: 0,
            dictionaryScore: 0,
            feedback,
            color: this._getColorForLevel(level),
            label: this._getLabelForLevel(level)
        };
    }
}
