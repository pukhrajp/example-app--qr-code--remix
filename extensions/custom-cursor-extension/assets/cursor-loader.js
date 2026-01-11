/**
 * Custom Cursor Loader
 * 
 * Main JavaScript file for loading and applying custom cursors on Shopify storefronts.
 * This script fetches cursor configuration from the app's API endpoint and injects
 * the generated CSS into the page.
 * 
 * Features:
 * - Fetches cursor data from API endpoint
 * - Generates CSS using CustomCursorStyleGenerator
 * - Injects CSS into document head
 * - Handles merchant settings (enable/disable)
 * - Error handling and logging
 * 
 * @requires CustomCursorStyleGenerator (cursor-style-generator.js)
 * @module cursorLoader
 */

(function(window, document) {
  'use strict';

  // Configuration
  var CONFIG = {
    API_ENDPOINT: '/apps/cursor-data', // App proxy endpoint
    CACHE_KEY: 'custom_cursor_data',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
    STYLE_TAG_ID: 'custom-cursor-styles',
    LOG_PREFIX: '[Custom Cursor]',
    // Error handling configuration
    MAX_RETRIES: 3,                   // Maximum number of retry attempts
    RETRY_DELAY: 1000,                // Initial retry delay (1 second)
    RETRY_BACKOFF_MULTIPLIER: 2,      // Exponential backoff multiplier
    NETWORK_TIMEOUT: 10000            // Network request timeout (10 seconds)
  };

  /**
   * Logger utility for consistent console output
   */
  var Logger = {
    log: function(message, data) {
      console.log(CONFIG.LOG_PREFIX + ' ' + message, data || '');
    },
    warn: function(message, data) {
      console.warn(CONFIG.LOG_PREFIX + ' ' + message, data || '');
    },
    error: function(message, error) {
      console.error(CONFIG.LOG_PREFIX + ' ' + message, error || '');
    }
  };

  /**
   * Mobile Detection Utility
   * 
   * Provides robust mobile device detection including:
   * - User agent string analysis
   * - Touch capability detection
   * - Screen size consideration
   * - Tablet detection
   */
  var MobileDetector = {
    /**
     * Check if device is mobile based on user agent
     * 
     * @returns {boolean} True if mobile device detected
     */
    isMobileUserAgent: function() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
      
      // Mobile device patterns
      var mobilePatterns = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /IEMobile/i,
        /Opera Mini/i,
        /Mobile/i,
        /mobile/i
      ];
      
      // Check if any pattern matches
      for (var i = 0; i < mobilePatterns.length; i++) {
        if (mobilePatterns[i].test(userAgent)) {
          return true;
        }
      }
      
      return false;
    },

    /**
     * Check if device has touch capability
     * 
     * @returns {boolean} True if touch is supported
     */
    isTouchDevice: function() {
      // Check for touch events
      var hasTouchEvents = 'ontouchstart' in window;
      
      // Check for touch points
      var hasTouchPoints = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
      
      // Check for pointer (IE/Edge)
      var hasPointer = window.navigator.pointerEnabled && navigator.maxTouchPoints > 0;
      var hasMsPointer = window.navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0;
      
      return hasTouchEvents || hasTouchPoints || hasPointer || hasMsPointer;
    },

    /**
     * Check if device is likely a tablet (larger touch device)
     * 
     * @returns {boolean} True if device appears to be a tablet
     */
    isTablet: function() {
      var userAgent = navigator.userAgent || '';
      
      // Tablet-specific patterns
      var tabletPatterns = [
        /iPad/i,
        /Android.*Tablet/i,
        /Tablet/i,
        /PlayBook/i,
        /Kindle/i,
        /Silk/i
      ];
      
      for (var i = 0; i < tabletPatterns.length; i++) {
        if (tabletPatterns[i].test(userAgent)) {
          return true;
        }
      }
      
      // Also check if touch device with large screen
      if (this.isTouchDevice() && window.screen && window.screen.width >= 768) {
        return true;
      }
      
      return false;
    },

    /**
     * Check if device is mobile phone (not tablet)
     * 
     * @returns {boolean} True if mobile phone
     */
    isMobilePhone: function() {
      return this.isMobileUserAgent() && !this.isTablet();
    },

    /**
     * Main detection function - determines if custom cursor should be disabled
     * 
     * @param {boolean} disableOnTablets - Whether to disable on tablets too
     * @returns {Object} Detection result with device type and recommendation
     */
    detect: function(disableOnTablets) {
      disableOnTablets = disableOnTablets !== false; // Default to true
      
      var isPhone = this.isMobilePhone();
      var isTablet = this.isTablet();
      var isMobile = this.isMobileUserAgent();
      var isTouch = this.isTouchDevice();
      
      var result = {
        isMobilePhone: isPhone,
        isTablet: isTablet,
        isMobileDevice: isMobile,
        isTouchDevice: isTouch,
        shouldDisableCursor: false,
        reason: null
      };
      
      // Determine if cursor should be disabled
      if (isPhone) {
        result.shouldDisableCursor = true;
        result.reason = 'Mobile phone detected';
      } else if (isTablet && disableOnTablets) {
        result.shouldDisableCursor = true;
        result.reason = 'Tablet detected (disabled by settings)';
      }
      
      return result;
    },

    /**
     * Simple check - returns true if device is mobile/touch
     * 
     * @returns {boolean}
     */
    isMobile: function() {
      return this.isMobileUserAgent() || this.isTouchDevice();
    }
  };

  /**
   * Cache Manager Utility
   * 
   * Manages client-side caching of cursor data using localStorage
   * Features:
   * - Cache expiration based on time
   * - Cache validation
   * - Error handling for storage issues
   * - Automatic cleanup of expired data
   */
  var CacheManager = {
    /**
     * Check if localStorage is available
     * 
     * @returns {boolean} True if localStorage is supported and available
     */
    isAvailable: function() {
      try {
        var test = '__storage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Get data from cache
     * 
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null if not found/expired
     */
    get: function(key) {
      if (!this.isAvailable()) {
        Logger.warn('localStorage not available');
        return null;
      }

      try {
        var cached = window.localStorage.getItem(key);
        if (!cached) {
          return null;
        }

        var data = JSON.parse(cached);
        
        // Check if expired
        if (data.expiry && Date.now() > data.expiry) {
          Logger.log('Cache expired for key: ' + key);
          this.remove(key);
          return null;
        }

        Logger.log('Cache hit for key: ' + key);
        return data.value;
      } catch (e) {
        Logger.error('Error reading from cache:', e);
        return null;
      }
    },

    /**
     * Set data in cache
     * 
     * @param {string} key - Cache key
     * @param {*} value - Data to cache
     * @param {number} ttl - Time to live in milliseconds (default: from CONFIG)
     * @returns {boolean} True if successful
     */
    set: function(key, value, ttl) {
      if (!this.isAvailable()) {
        return false;
      }

      ttl = ttl || CONFIG.CACHE_DURATION;

      try {
        var cacheData = {
          value: value,
          expiry: Date.now() + ttl,
          timestamp: Date.now()
        };

        window.localStorage.setItem(key, JSON.stringify(cacheData));
        Logger.log('Cache set for key: ' + key + ' (TTL: ' + (ttl / 1000) + 's)');
        return true;
      } catch (e) {
        Logger.error('Error writing to cache:', e);
        
        // Try to clear old data if quota exceeded
        if (e.name === 'QuotaExceededError') {
          Logger.warn('Storage quota exceeded, clearing cache');
          this.clear();
        }
        
        return false;
      }
    },

    /**
     * Remove data from cache
     * 
     * @param {string} key - Cache key
     */
    remove: function(key) {
      if (!this.isAvailable()) {
        return;
      }

      try {
        window.localStorage.removeItem(key);
        Logger.log('Cache removed for key: ' + key);
      } catch (e) {
        Logger.error('Error removing from cache:', e);
      }
    },

    /**
     * Clear all cursor-related cache
     */
    clear: function() {
      if (!this.isAvailable()) {
        return;
      }

      try {
        // Only remove cursor-related keys
        var keys = [];
        for (var i = 0; i < window.localStorage.length; i++) {
          var key = window.localStorage.key(i);
          if (key && key.indexOf('custom_cursor') === 0) {
            keys.push(key);
          }
        }

        for (var j = 0; j < keys.length; j++) {
          window.localStorage.removeItem(keys[j]);
        }

        Logger.log('Cache cleared (' + keys.length + ' items)');
      } catch (e) {
        Logger.error('Error clearing cache:', e);
      }
    },

    /**
     * Get cache statistics
     * 
     * @returns {Object} Cache stats (size, count, etc.)
     */
    getStats: function() {
      if (!this.isAvailable()) {
        return { available: false };
      }

      try {
        var count = 0;
        var size = 0;

        for (var i = 0; i < window.localStorage.length; i++) {
          var key = window.localStorage.key(i);
          if (key && key.indexOf('custom_cursor') === 0) {
            count++;
            var item = window.localStorage.getItem(key);
            size += item ? item.length : 0;
          }
        }

        return {
          available: true,
          count: count,
          size: size,
          sizeKB: Math.round(size / 1024 * 100) / 100
        };
      } catch (e) {
        Logger.error('Error getting cache stats:', e);
        return { available: true, error: e.message };
      }
    }
  };

  /**
   * Error Handler Utility
   * 
   * Provides comprehensive error handling and recovery mechanisms
   * Features:
   * - Network error detection
   * - Retry logic with exponential backoff
   * - Offline detection
   * - User-friendly error messages
   */
  var ErrorHandler = {
    /**
     * Check if browser is online
     * 
     * @returns {boolean} True if online
     */
    isOnline: function() {
      return navigator.onLine !== false; // Default to true if undefined
    },

    /**
     * Categorize error type
     * 
     * @param {Error} error - Error object
     * @returns {string} Error category
     */
    categorizeError: function(error) {
      var message = error.message || '';
      
      if (!this.isOnline()) {
        return 'offline';
      }
      
      if (message.indexOf('fetch') !== -1 || message.indexOf('Failed to fetch') !== -1) {
        return 'network';
      }
      
      if (message.indexOf('timeout') !== -1 || message.indexOf('Timeout') !== -1) {
        return 'timeout';
      }
      
      if (message.indexOf('HTTP error') !== -1) {
        if (message.indexOf('404') !== -1) return 'not_found';
        if (message.indexOf('500') !== -1 || message.indexOf('503') !== -1) return 'server';
        if (message.indexOf('401') !== -1 || message.indexOf('403') !== -1) return 'auth';
        return 'http';
      }
      
      if (message.indexOf('Invalid') !== -1 || message.indexOf('parse') !== -1) {
        return 'data';
      }
      
      return 'unknown';
    },

    /**
     * Get user-friendly error message
     * 
     * @param {string} category - Error category
     * @returns {string} User-friendly message
     */
    getUserMessage: function(category) {
      var messages = {
        offline: 'You appear to be offline. Custom cursor will load when connection is restored.',
        network: 'Network error occurred. Retrying...',
        timeout: 'Request timed out. Retrying...',
        not_found: 'Cursor configuration not found. Please check app settings.',
        server: 'Server error. Will retry automatically.',
        auth: 'Authentication error. Please refresh the page.',
        http: 'HTTP error occurred. Retrying...',
        data: 'Invalid data received. Using cached version if available.',
        unknown: 'An error occurred loading custom cursor.'
      };
      
      return messages[category] || messages.unknown;
    },

    /**
     * Calculate retry delay with exponential backoff
     * 
     * @param {number} attempt - Current attempt number (0-based)
     * @returns {number} Delay in milliseconds
     */
    getRetryDelay: function(attempt) {
      var baseDelay = CONFIG.RETRY_DELAY;
      var multiplier = CONFIG.RETRY_BACKOFF_MULTIPLIER;
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      var delay = baseDelay * Math.pow(multiplier, attempt);
      
      // Add jitter (±20%) to avoid thundering herd
      var jitter = delay * 0.2 * (Math.random() - 0.5);
      
      return Math.floor(delay + jitter);
    },

    /**
     * Check if error is retryable
     * 
     * @param {string} category - Error category
     * @returns {boolean} True if should retry
     */
    shouldRetry: function(category) {
      // Don't retry these errors
      var nonRetryable = ['auth', 'not_found', 'data'];
      return nonRetryable.indexOf(category) === -1;
    },

    /**
     * Handle error with logging and user feedback
     * 
     * @param {Error} error - Error object
     * @param {number} attempt - Current attempt number
     * @param {number} maxAttempts - Maximum attempts
     * @returns {Object} Error info
     */
    handle: function(error, attempt, maxAttempts) {
      var category = this.categorizeError(error);
      var userMessage = this.getUserMessage(category);
      var shouldRetry = this.shouldRetry(category) && attempt < maxAttempts;
      var retryDelay = shouldRetry ? this.getRetryDelay(attempt) : 0;
      
      var errorInfo = {
        category: category,
        message: error.message,
        userMessage: userMessage,
        shouldRetry: shouldRetry,
        retryDelay: retryDelay,
        attempt: attempt + 1,
        maxAttempts: maxAttempts,
        isOnline: this.isOnline()
      };
      
      // Log error
      if (shouldRetry) {
        Logger.warn(
          'Error (attempt ' + errorInfo.attempt + '/' + maxAttempts + '): ' + 
          category + ' - ' + userMessage,
          { willRetryIn: retryDelay + 'ms' }
        );
      } else {
        Logger.error(
          'Error (final): ' + category + ' - ' + userMessage,
          error
        );
      }
      
      return errorInfo;
    }
  };

  /**
   * Fetch with timeout
   * 
   * @param {string} url - URL to fetch
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Fetch promise with timeout
   */
  function fetchWithTimeout(url, timeout) {
    return new Promise(function(resolve, reject) {
      var timeoutId = setTimeout(function() {
        reject(new Error('Request timeout after ' + timeout + 'ms'));
      }, timeout);

      fetch(url)
        .then(function(response) {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(function(error) {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Fetches cursor data from the API endpoint with caching and retry logic
   * 
   * @param {string} shopDomain - The shop's myshopify.com domain
   * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
   * @param {number} attempt - Current retry attempt (default: 0)
   * @returns {Promise<Object>} Cursor data from API or cache
   */
  function fetchCursorData(shopDomain, forceRefresh, attempt) {
    attempt = attempt || 0;
    var cacheKey = CONFIG.CACHE_KEY + '_' + shopDomain;

    // Try to get from cache first (unless force refresh)
    if (!forceRefresh) {
      var cachedData = CacheManager.get(cacheKey);
      if (cachedData) {
        Logger.log('Using cached cursor data');
        return Promise.resolve(cachedData);
      }
    }

    // Build API URL
    var apiUrl = CONFIG.API_ENDPOINT + '?shop=' + encodeURIComponent(shopDomain);
    
    Logger.log('Fetching cursor data from API...' + (attempt > 0 ? ' (attempt ' + (attempt + 1) + ')' : ''), apiUrl);

    // Fetch with timeout
    return fetchWithTimeout(apiUrl, CONFIG.NETWORK_TIMEOUT)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(function(result) {
        Logger.log('API response received:', result);
        
        // Validate response structure
        if (!result || typeof result.success !== 'boolean') {
          throw new Error('Invalid API response format');
        }

        if (!result.success) {
          throw new Error(result.error || 'API returned error');
        }

        var cursorData = result.data;

        // Cache the successful response
        if (cursorData) {
          CacheManager.set(cacheKey, cursorData);
        }

        return cursorData;
      })
      .catch(function(error) {
        // Handle error with retry logic
        var errorInfo = ErrorHandler.handle(error, attempt, CONFIG.MAX_RETRIES);
        
        // If should retry, wait and try again
        if (errorInfo.shouldRetry) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              // Recursively retry
              fetchCursorData(shopDomain, forceRefresh, attempt + 1)
                .then(resolve)
                .catch(reject);
            }, errorInfo.retryDelay);
          });
        }
        
        // No more retries - try to use cached data as fallback
        Logger.warn('All retries exhausted. Attempting to use cached data...');
        var cachedFallback = CacheManager.get(cacheKey);
        if (cachedFallback) {
          Logger.log('Using stale cached data as fallback');
          return cachedFallback;
        }
        
        // No cache available, throw error
        throw error;
      });
  }

  /**
   * Injects CSS into the document head
   * 
   * @param {string} cssCode - The CSS code to inject
   */
  function injectCSS(cssCode) {
    // Remove existing cursor styles if present
    var existingStyle = document.getElementById(CONFIG.STYLE_TAG_ID);
    if (existingStyle) {
      existingStyle.remove();
      Logger.log('Removed existing cursor styles');
    }

    // Create new style tag
    var styleTag = document.createElement('style');
    styleTag.id = CONFIG.STYLE_TAG_ID;
    styleTag.type = 'text/css';
    styleTag.textContent = cssCode;

    // Append to head
    document.head.appendChild(styleTag);
    
    Logger.log('CSS injected successfully', {
      length: cssCode.length + ' characters'
    });
  }

  /**
   * Removes cursor styles from the document
   */
  function removeCursorStyles() {
    var existingStyle = document.getElementById(CONFIG.STYLE_TAG_ID);
    if (existingStyle) {
      existingStyle.remove();
      Logger.log('Cursor styles removed');
    }
  }

  /**
   * Main function to load and apply custom cursor
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.shopDomain - Shop's myshopify.com domain
   * @param {boolean} options.disableOnMobile - Whether to disable on mobile devices
   */
  function loadCustomCursor(options) {
    // Validate options
    if (!options || !options.shopDomain) {
      Logger.error('Shop domain is required');
      return;
    }

    var shopDomain = options.shopDomain;
    var disableOnMobile = options.disableOnMobile !== false; // Default to true

    Logger.log('Initializing custom cursor...', {
      shop: shopDomain,
      disableOnMobile: disableOnMobile
    });

    // Perform mobile detection
    if (disableOnMobile) {
      var detection = MobileDetector.detect(true); // true = disable on tablets too
      
      Logger.log('Mobile detection result:', detection);
      
      if (detection.shouldDisableCursor) {
        Logger.log('Custom cursor disabled: ' + detection.reason);
        removeCursorStyles();
        return;
      }
    }

    // Check if CustomCursorStyleGenerator is available
    if (typeof window.CustomCursorStyleGenerator === 'undefined') {
      Logger.error('CustomCursorStyleGenerator not found. Make sure cursor-style-generator.js is loaded first.');
      return;
    }

    // Fetch cursor data and apply
    fetchCursorData(shopDomain)
      .then(function(cursorData) {
        Logger.log('Cursor data received:', cursorData);

        // Check if cursor is enabled
        if (!cursorData || !cursorData.isEnabled) {
          Logger.log('Custom cursor is disabled or not configured');
          removeCursorStyles();
          return;
        }

        // Check if we have cursor details
        if (!cursorData.cursor) {
          Logger.log('No active cursor selected');
          removeCursorStyles();
          return;
        }

        // Generate CSS using the style generator
        var css = window.CustomCursorStyleGenerator.generateCursorCSS(cursorData);

        if (!css) {
          Logger.warn('CSS generation returned null. Cursor may be invalid.');
          removeCursorStyles();
          return;
        }

        // Inject CSS into page
        injectCSS(css);

        Logger.log('Custom cursor loaded successfully!', {
          cursorName: cursorData.cursor.name || 'Unknown',
          cursorId: cursorData.cursor.id || 'Unknown'
        });
      })
      .catch(function(error) {
        Logger.error('Failed to load custom cursor:', error);
        removeCursorStyles();
      });
  }

  /**
   * Initialize cursor loader when DOM is ready
   * 
   * @param {Object} config - Configuration from Liquid
   * @param {string} config.shopDomain - Shop's myshopify.com domain
   * @param {boolean} config.disableOnMobile - Whether to disable on mobile
   */
  function init(config) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        loadCustomCursor(config);
      });
    } else {
      // DOM is already ready
      loadCustomCursor(config);
    }
  }

  // Export to global namespace
  window.CustomCursorLoader = {
    init: init,
    load: loadCustomCursor,
    remove: removeCursorStyles,
    detectMobile: function() {
      return MobileDetector.detect(true);
    },
    isMobile: function() {
      return MobileDetector.isMobile();
    },
    // Cache management functions
    cache: {
      clear: function() {
        return CacheManager.clear();
      },
      get: function(key) {
        return CacheManager.get(key);
      },
      remove: function(key) {
        return CacheManager.remove(key);
      },
      stats: function() {
        return CacheManager.getStats();
      }
    },
    // Error handling utilities
    error: {
      isOnline: function() {
        return ErrorHandler.isOnline();
      },
      categorize: function(error) {
        return ErrorHandler.categorizeError(error);
      }
    },
    // Refresh cursor data (bypass cache)
    refresh: function(shopDomain) {
      if (!shopDomain) {
        Logger.error('Shop domain required for refresh');
        return;
      }
      Logger.log('Forcing cursor data refresh...');
      return fetchCursorData(shopDomain, true);
    },
    version: '1.3.0' // Updated version for error handling
  };

  Logger.log('Cursor loader initialized (v1.3.0)');

})(window, document);
