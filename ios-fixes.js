// iOS-specific fixes and enhancements for PetTracker PWA
// This file contains special handling for iOS to improve PWA experience on iPhone/iPad

/**
 * Check if the current device is running iOS
 * @returns {boolean} True if running on iOS device
 */
function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  
  /**
   * Check if the app is running in standalone mode (installed as PWA)
   * @returns {boolean} True if running as installed PWA
   */
  function isRunningAsStandalone() {
    return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  }
  
  /**
   * Shows the iOS installation banner if conditions are met
   */
  function showIOSInstallBanner() {
    if (isIOSDevice() && !isRunningAsStandalone()) {
      // Only show if not dismissed before
      if (!sessionStorage.getItem('installBannerDismissed')) {
        setTimeout(() => {
          const banner = document.getElementById('iosInstallBanner');
          if (banner) {
            banner.style.display = 'block';
          }
        }, 3000); // Show after 3 seconds
      }
    }
  }
  
  /**
   * Closes the iOS installation banner and remembers the choice
   */
  function closeInstallBanner() {
    const banner = document.getElementById('iosInstallBanner');
    if (banner) {
      banner.style.display = 'none';
    }
    sessionStorage.setItem('installBannerDismissed', 'true');
  }
  
  /**
   * Applies iOS safe area insets for devices with notches
   */
  function applyIOSSafeAreas() {
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      // Apply safe area insets to key elements
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      
      // Adjust header to account for notch
      const header = document.querySelector('.header');
      if (header) {
        header.style.paddingTop = 'env(safe-area-inset-top)';
      }
      
      // Adjust footer for home indicator
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.paddingBottom = 'env(safe-area-inset-bottom)';
      }
    }
  }
  
  /**
   * Fixes the iOS 100vh viewport issue
   * Safari on iOS doesn't handle 100vh correctly because of the address bar
   */
  function fixIOSViewportHeight() {
    // Set CSS variable based on real viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update on resize
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }
  
  /**
   * Initializes audio context to work around iOS restrictions
   * Audio context must be started after user interaction
   */
  function initIOSAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      // Wait for user interaction
      document.addEventListener('click', function initAudio() {
        const audioCtx = new AudioContext();
        document.removeEventListener('click', initAudio);
      }, { once: true });
    }
  }
  
  /**
   * Disables gesture zooming on iOS devices
   */
  function disableIOSGestureZoom() {
    document.addEventListener('gesturestart', function(e) {
      e.preventDefault();
    });
    
    document.addEventListener('gesturechange', function(e) {
      e.preventDefault();
    });
    
    document.addEventListener('gestureend', function(e) {
      e.preventDefault();
    });
  }
  
  /**
   * Fixes the 300ms tap delay on iOS Safari
   */
  function fixIOSTapDelay() {
    // Apply to all clickable elements
    const clickables = document.querySelectorAll('a, button, .tab, .collage-item, .color-option');
    clickables.forEach(element => {
      element.addEventListener('touchend', function(e) {
        // Prevent double event triggering
        if (e.cancelable) {
          e.preventDefault();
        }
        
        // Trigger a fast click instead
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        e.target.dispatchEvent(clickEvent);
      });
    });
  }
  
  /**
   * Adds workarounds for iOS scroll momentum issues
   */
  function fixIOSScrolling() {
    // Add overscroll-behavior if supported
    if (CSS.supports('overscroll-behavior: contain')) {
      document.body.style.overscrollBehavior = 'contain';
    } else {
      // Fallback for older iOS versions
      document.body.addEventListener('touchmove', function(e) {
        const element = e.target;
        const isScrollable = element.scrollHeight > element.clientHeight;
        
        // If it's not scrollable or already at the end of scroll
        if (!isScrollable || 
            (element.scrollTop === 0 && e.touches[0].screenY > e.touches[1].screenY) || 
            (element.scrollTop + element.clientHeight === element.scrollHeight && e.touches[0].screenY < e.touches[1].screenY)) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }
  
  /**
   * Initialize all iOS-specific fixes
   */
  function initIOSFixes() {
    if (isIOSDevice()) {
      document.body.classList.add('ios-device');
      
      // Apply all fixes
      showIOSInstallBanner();
      applyIOSSafeAreas();
      fixIOSViewportHeight();
      initIOSAudio();
      disableIOSGestureZoom();
      fixIOSTapDelay();
      fixIOSScrolling();
      
      console.log('Applied iOS-specific fixes for PetTracker PWA');
    }
  }
  
  // Run when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initIOSFixes);
  
  // Export functions for use in main app
  window.iosFixes = {
    isIOSDevice,
    isRunningAsStandalone,
    closeInstallBanner,
    showIOSInstallBanner
  };