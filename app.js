/**
 * Free Password Generator - Main Application Entry Point
 * 
 * This is the main JavaScript module that initializes the password generator application.
 * It follows a modular architecture with separate components for:
 * - Password generation (PasswordGenerator)
 * - Strength evaluation (StrengthMeter)
 * - Clipboard operations (ClipboardManager)
 * - History management (HistoryManager)
 * - UI control (UIController)
 * 
 * All password generation is performed client-side using the Web Crypto API.
 * No data is transmitted to any server.
 */

// Module imports
import { PasswordGenerator } from './modules/PasswordGenerator.js';
import { StrengthMeter } from './modules/StrengthMeter.js';
import { ClipboardManager } from './modules/ClipboardManager.js';
import { HistoryManager } from './modules/HistoryManager.js';
import { UIController } from './modules/UIController.js';

/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Free Password Generator initialized');
    
    // Check for required browser APIs
    const browserSupported = checkBrowserSupport();
    
    if (!browserSupported) {
        return; // Don't initialize if browser is not supported
    }
    
    // Initialize components
    const passwordGenerator = new PasswordGenerator();
    const strengthMeter = new StrengthMeter();
    const clipboardManager = new ClipboardManager();
    const historyManager = new HistoryManager();
    const uiController = new UIController({
        passwordGenerator,
        strengthMeter,
        clipboardManager,
        historyManager
    });
    
    // Initialize UI controller
    uiController.initialize();
    
    console.log('All components initialized successfully');
});

/**
 * Check if the browser supports required APIs
 * Display error messages if critical APIs are unavailable
 * @returns {boolean} - True if browser is supported, false otherwise
 */
function checkBrowserSupport() {
    const errors = [];
    
    // Check for Crypto API (critical)
    if (!window.crypto || !window.crypto.getRandomValues) {
        errors.push('Your browser doesn\'t support secure password generation (Web Crypto API). Please use a modern browser like Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+.');
    }
    
    // Check for Clipboard API (non-critical, has fallback)
    if (!navigator.clipboard) {
        console.warn('Clipboard API not available. Will use fallback method.');
    }
    
    // Display errors if any
    if (errors.length > 0) {
        displayBrowserError(errors);
        return false;
    }
    
    return true;
}

/**
 * Display browser compatibility error message
 * @param {string[]} errors - Array of error messages
 */
function displayBrowserError(errors) {
    const main = document.querySelector('main');
    if (!main) return;
    
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
        background: #fee2e2;
        border: 2px solid #ef4444;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin: 2rem auto;
        max-width: 800px;
        color: #991b1b;
    `;
    
    errorContainer.innerHTML = `
        <h2 style="margin-bottom: 1rem; color: #991b1b;">⚠️ Browser Compatibility Issue</h2>
        ${errors.map(error => `<p style="margin-bottom: 0.5rem;">${error}</p>`).join('')}
    `;
    
    main.insertBefore(errorContainer, main.firstChild);
    
    // Disable the generator section
    const generatorSection = document.getElementById('generator');
    if (generatorSection) {
        generatorSection.style.opacity = '0.5';
        generatorSection.style.pointerEvents = 'none';
    }
}

/**
 * Export for testing purposes
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkBrowserSupport
    };
}
