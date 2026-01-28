/**
 * UIController Module
 * 
 * Manages all user interface interactions and state management.
 * Coordinates between the UI and other components (PasswordGenerator, StrengthMeter, etc.).
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 4.2, 5.1, 5.2, 6.1, 6.3, 7.1, 7.4, 7.5
 */

export class UIController {
    constructor({ passwordGenerator, strengthMeter, clipboardManager, historyManager }) {
        this.passwordGenerator = passwordGenerator;
        this.strengthMeter = strengthMeter;
        this.clipboardManager = clipboardManager;
        this.historyManager = historyManager;
        
        // DOM element references (will be initialized in initialize())
        this.elements = {};
        
        // Application state
        this.state = {
            currentPassword: '',
            isPasswordVisible: true, // Start with visible password
            autoCopyEnabled: false,
            config: {
                length: 16,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSpecialChars: true,
                customSpecialChars: '',
                excludeSimilar: false,
                allowDuplicates: true,
                includeSpaces: false,
                count: 1
            }
        };
    }
    
    /**
     * Initialize the UI controller
     * Query and store references to all DOM elements
     * Set up event listeners for all interactive elements
     */
    initialize() {
        // Query and store all DOM element references
        this.elements = {
            // Password display
            passwordOutput: document.getElementById('password-output'),
            toggleVisibility: document.getElementById('toggle-visibility'),
            copyButton: document.getElementById('copy-button'),
            generateButton: document.getElementById('generate-button'),
            copyFeedback: document.getElementById('copy-feedback'),
            
            // Strength meter
            strengthBar: document.getElementById('strength-bar'),
            strengthText: document.getElementById('strength-text'),
            
            // Configuration controls
            lengthSlider: document.getElementById('length-slider'),
            lengthValue: document.getElementById('length-value'),
            includeUppercase: document.getElementById('include-uppercase'),
            includeLowercase: document.getElementById('include-lowercase'),
            includeNumbers: document.getElementById('include-numbers'),
            includeSpecial: document.getElementById('include-special'),
            customSpecial: document.getElementById('custom-special'),
            excludeSimilar: document.getElementById('exclude-similar'),
            allowDuplicates: document.getElementById('allow-duplicates'),
            includeSpaces: document.getElementById('include-spaces'),
            autoCopy: document.getElementById('auto-copy'),
            passwordCount: document.getElementById('password-count'),
            
            // History
            historyList: document.getElementById('history-list'),
            historyEmpty: document.getElementById('history-empty'),
            clearHistory: document.getElementById('clear-history')
        };
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Initialize UI state
        this._updateHistoryDisplay();
    }
    
    /**
     * Set up event listeners for all interactive elements
     * @private
     */
    _setupEventListeners() {
        // Generate button
        this.elements.generateButton.addEventListener('click', () => {
            this.handleGenerateClick();
        });
        
        // Copy button
        this.elements.copyButton.addEventListener('click', () => {
            this.handleCopyClick();
        });
        
        // Toggle visibility button
        this.elements.toggleVisibility.addEventListener('click', () => {
            this._handleToggleVisibility();
        });
        
        // Length slider
        this.elements.lengthSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.config.length = value;
            this.elements.lengthValue.textContent = value;
            this.elements.lengthSlider.setAttribute('aria-valuenow', value);
        });
        
        // Character type checkboxes
        this.elements.includeUppercase.addEventListener('change', (e) => {
            this._handleCharacterTypeChange('includeUppercase', e.target.checked);
        });
        
        this.elements.includeLowercase.addEventListener('change', (e) => {
            this._handleCharacterTypeChange('includeLowercase', e.target.checked);
        });
        
        this.elements.includeNumbers.addEventListener('change', (e) => {
            this._handleCharacterTypeChange('includeNumbers', e.target.checked);
        });
        
        this.elements.includeSpecial.addEventListener('change', (e) => {
            this._handleCharacterTypeChange('includeSpecialChars', e.target.checked);
        });
        
        // Custom special characters
        this.elements.customSpecial.addEventListener('input', (e) => {
            this.state.config.customSpecialChars = e.target.value;
        });
        
        // Additional options
        this.elements.excludeSimilar.addEventListener('change', (e) => {
            this.state.config.excludeSimilar = e.target.checked;
        });
        
        this.elements.allowDuplicates.addEventListener('change', (e) => {
            this.state.config.allowDuplicates = e.target.checked;
        });
        
        this.elements.includeSpaces.addEventListener('change', (e) => {
            this.state.config.includeSpaces = e.target.checked;
        });
        
        this.elements.autoCopy.addEventListener('change', (e) => {
            this.state.autoCopyEnabled = e.target.checked;
        });
        
        // Password count
        this.elements.passwordCount.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 10) {
                this.state.config.count = value;
            }
        });
        
        // Clear history button
        this.elements.clearHistory.addEventListener('click', () => {
            this.handleClearHistoryClick();
        });
    }
    
    /**
     * Handle character type checkbox changes
     * Ensure at least one character type is always selected
     * @private
     */
    _handleCharacterTypeChange(setting, checked) {
        // Check if this would disable all character types
        if (!checked) {
            const { includeUppercase, includeLowercase, includeNumbers, includeSpecialChars } = this.state.config;
            const currentTypes = {
                includeUppercase,
                includeLowercase,
                includeNumbers,
                includeSpecialChars
            };
            currentTypes[setting] = false;
            
            // Count how many types would be enabled
            const enabledCount = Object.values(currentTypes).filter(v => v).length;
            
            if (enabledCount === 0) {
                // Prevent disabling the last character type
                // Keep the checkbox checked
                const checkbox = this.elements[setting.replace('include', 'include').replace('Chars', '')];
                if (setting === 'includeUppercase') checkbox.checked = true;
                else if (setting === 'includeLowercase') checkbox.checked = true;
                else if (setting === 'includeNumbers') checkbox.checked = true;
                else if (setting === 'includeSpecialChars') this.elements.includeSpecial.checked = true;
                
                // Show warning message
                this._showWarning('At least one character type must be selected');
                return;
            }
        }
        
        // Update state
        this.state.config[setting] = checked;
    }
    
    /**
     * Show warning message
     * @private
     */
    _showWarning(message) {
        // Use the copy feedback element to show warnings
        this.elements.copyFeedback.textContent = message;
        this.elements.copyFeedback.style.color = '#fd7e14'; // Orange color
        this.elements.copyFeedback.style.display = 'block';
        
        setTimeout(() => {
            this.elements.copyFeedback.style.display = 'none';
        }, 3000);
    }
    
    /**
     * Handle generate button click
     * Generate password and update UI
     */
    handleGenerateClick() {
        try {
            // Save current password to history before generating new one (Requirement 6.3)
            if (this.state.currentPassword) {
                this.historyManager.add(this.state.currentPassword);
            }
            
            // Generate password(s)
            const passwords = this.passwordGenerator.generate(this.state.config);
            
            // For now, display the first password (multi-password support can be added later)
            const password = passwords[0];
            
            // Update current password state
            this.state.currentPassword = password;
            
            // Update password display
            this.updatePasswordDisplay(password);
            
            // Evaluate and update strength display
            const strengthResult = this.strengthMeter.evaluate(password);
            this.updateStrengthDisplay(strengthResult);
            
            // Add to history
            this.historyManager.add(password);
            this._updateHistoryDisplay();
            
            // Auto-copy if enabled
            if (this.state.autoCopyEnabled) {
                this._copyToClipboard(password);
            }
            
        } catch (error) {
            console.error('Password generation error:', error);
            this._showWarning(error.message || 'Failed to generate password');
        }
    }
    
    /**
     * Handle copy button click
     */
    handleCopyClick() {
        if (!this.state.currentPassword) {
            this._showWarning('No password to copy. Generate a password first.');
            return;
        }
        
        this._copyToClipboard(this.state.currentPassword);
    }
    
    /**
     * Copy text to clipboard and show feedback
     * @private
     */
    async _copyToClipboard(text) {
        try {
            const success = await this.clipboardManager.copy(text);
            if (success) {
                this.showCopyFeedback();
            } else {
                this._showWarning('Failed to copy to clipboard');
            }
        } catch (error) {
            console.error('Copy error:', error);
            this._showWarning('Failed to copy to clipboard');
        }
    }
    
    /**
     * Handle toggle visibility button click
     * @private
     */
    _handleToggleVisibility() {
        this.state.isPasswordVisible = !this.state.isPasswordVisible;
        
        // Update input type
        this.elements.passwordOutput.type = this.state.isPasswordVisible ? 'text' : 'password';
        
        // Update button icon (toggle between eye-open and eye-closed)
        const eyeOpen = this.elements.toggleVisibility.querySelectorAll('.eye-open');
        const eyeClosed = this.elements.toggleVisibility.querySelectorAll('.eye-closed');
        
        if (this.state.isPasswordVisible) {
            // Show eye-open icon
            eyeOpen.forEach(el => el.style.display = '');
            eyeClosed.forEach(el => el.style.display = 'none');
        } else {
            // Show eye-closed icon
            eyeOpen.forEach(el => el.style.display = 'none');
            eyeClosed.forEach(el => el.style.display = '');
        }
        
        // Update aria-label
        this.elements.toggleVisibility.setAttribute(
            'aria-label',
            this.state.isPasswordVisible ? 'Hide password' : 'Show password'
        );
    }
    
    /**
     * Handle configuration changes
     * @param {string} setting - Setting name
     * @param {*} value - New value
     */
    handleConfigChange(setting, value) {
        if (this.state.config.hasOwnProperty(setting)) {
            this.state.config[setting] = value;
        }
    }
    
    /**
     * Handle history item click
     * @param {number} index - History item index
     */
    handleHistoryClick(index) {
        const history = this.historyManager.getAll();
        if (index >= 0 && index < history.length) {
            const password = history[index];
            
            // Update current password state
            this.state.currentPassword = password;
            
            // Update password display
            this.updatePasswordDisplay(password);
            
            // Evaluate and update strength display
            const strengthResult = this.strengthMeter.evaluate(password);
            this.updateStrengthDisplay(strengthResult);
        }
    }
    
    /**
     * Handle clear history button click
     */
    handleClearHistoryClick() {
        this.historyManager.clear();
        this._updateHistoryDisplay();
    }
    
    /**
     * Update password display
     * @param {string} password - Password to display
     */
    updatePasswordDisplay(password) {
        this.elements.passwordOutput.value = password;
        
        // Announce to screen readers
        this.elements.passwordOutput.setAttribute('aria-label', `Generated password: ${password}`);
    }
    
    /**
     * Update strength display
     * @param {Object} result - Strength evaluation result
     */
    updateStrengthDisplay(result) {
        // Update strength bar
        this.elements.strengthBar.style.width = `${result.score}%`;
        this.elements.strengthBar.style.backgroundColor = result.color;
        this.elements.strengthBar.setAttribute('aria-valuenow', result.score);
        
        // Update strength text
        this.elements.strengthText.textContent = result.label;
        this.elements.strengthText.style.color = result.color;
        
        // Update aria-label with feedback
        const feedbackText = result.feedback.join(' ');
        this.elements.strengthBar.setAttribute('aria-label', `Password strength: ${result.label}. ${feedbackText}`);
    }
    
    /**
     * Show copy feedback
     */
    showCopyFeedback() {
        this.elements.copyFeedback.textContent = '✓ Copied to clipboard!';
        this.elements.copyFeedback.style.color = '#28a745'; // Green color
        this.elements.copyFeedback.style.display = 'block';
        
        setTimeout(() => {
            this.elements.copyFeedback.style.display = 'none';
        }, 2000);
    }
    
    /**
     * Update history display
     * @private
     */
    _updateHistoryDisplay() {
        const history = this.historyManager.getAll();
        
        // Clear current list
        this.elements.historyList.innerHTML = '';
        
        if (history.length === 0) {
            // Show empty message
            this.elements.historyEmpty.style.display = 'block';
            this.elements.historyList.style.display = 'none';
        } else {
            // Hide empty message
            this.elements.historyEmpty.style.display = 'none';
            this.elements.historyList.style.display = 'block';
            
            // Display history items (most recent first)
            const reversedHistory = [...history].reverse();
            reversedHistory.forEach((password, displayIndex) => {
                const actualIndex = history.length - 1 - displayIndex;
                const li = document.createElement('li');
                li.className = 'history-item';
                
                const button = document.createElement('button');
                button.className = 'history-button';
                button.textContent = password;
                button.setAttribute('aria-label', `Select password: ${password}`);
                button.addEventListener('click', () => {
                    this.handleHistoryClick(actualIndex);
                });
                
                li.appendChild(button);
                this.elements.historyList.appendChild(li);
            });
        }
    }
}
