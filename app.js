// Check if the browser is online
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
      offlineIndicator.style.display = 'none';
    } else {
      offlineIndicator.style.display = 'block';
    }
  }
  
  // Initialize the UI based on capabilities
  function initApp() {
    const statusEl = document.getElementById('status');
    const notificationBtn = document.getElementById('notificationBtn');
    const permissionBtn = document.getElementById('permissionBtn');
    
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(() => {
          console.log('Service Worker Registered');
          statusEl.innerHTML = 'App ready to use! You can install it to your home screen.';
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
          statusEl.innerHTML = 'Some features may not work properly. Please try again.';
        });
    } else {
      statusEl.innerHTML = 'Your browser does not support all features.';
    }
    
    // Check notification permission
    if (Notification.permission === "granted") {
      permissionBtn.textContent = "Notifications Enabled";
      permissionBtn.disabled = true;
      notificationBtn.disabled = false;
    }
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial online status check
    updateOnlineStatus();
    
    // Initialize game
    initGame();
    
    // Simulate weather data
    simulateWeather();
    
    // Set up tabs
    setupTabs();
    
    // Setup install button
    setupInstallButton();
    
    // Setup color theme options
    setupColorOptions();
  }
  
  // Show toast message
  function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }
  
  // Request notification permissions
  function requestPermissions() {
    const notificationBtn = document.getElementById('notificationBtn');
    const permissionBtn = document.getElementById('permissionBtn');
    
    Notification.requestPermission().then(status => {
      if (status === "granted") {
        showToast("Notifications enabled!");
        permissionBtn.textContent = "Notifications Enabled";
        permissionBtn.disabled = true;
        notificationBtn.disabled = false;
        
        // Update notifications toggle in settings
        document.getElementById('notificationsToggle').checked = true;
      } else {
        showToast("Notification permission denied");
        document.getElementById('notificationsToggle').checked = false;
      }
    });
  }
  
  // Send test notification
  function sendNotification() {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration().then(reg => {
        const title = "PetTracker Alert";
        const options = {
          body: "Your pet is nearby! Tap to see details.",
          icon: "icon-192.png",
          badge: "icon-192.png",
          vibrate: [200, 100, 200],
          actions: [
            { action: 'view', title: 'View Pet' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        };
        
        reg.showNotification(title, options);
        showToast("Notification sent!");
        
        // Add to notifications list
        addNotification("Your pet is nearby!");
      });
    } else {
      showToast("Notifications are not allowed.");
    }
  }
  
  // Add notification to list
  function addNotification(message) {
    const list = document.getElementById('notifications-list');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (list.innerHTML.includes('No recent notifications')) {
      list.innerHTML = '';
    }
    
    const notificationHtml = `
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <div style="font-size: 14px;">${message}</div>
        <div style="font-size: 12px; color: #888;">${time}</div>
      </div>
    `;
    
    list.innerHTML = notificationHtml + list.innerHTML;
  }
  
  // Get current location
  function getLocation() {
    showToast("Getting location...");
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        showToast(`Location: ${lat}, ${lon}`);
      }, err => {
        console.error("Error getting location:", err);
        showToast("Error getting location. Please check permissions.");
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      showToast("Geolocation not supported on this device.");
    }
  }
  
  // Get detailed location
  function getDetailedLocation() {
    showToast("Getting detailed location...");
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        
        document.getElementById('location-details').innerHTML = `
          <div><strong>Latitude:</strong> ${lat}</div>
          <div><strong>Longitude:</strong> ${lon}</div>
          <div><strong>Accuracy:</strong> ${pos.coords.accuracy.toFixed(1)} meters</div>
          <div><strong>Last updated:</strong> ${new Date().toLocaleTimeString()}</div>
        `;
        
        document.getElementById('map-placeholder').innerHTML = `
          <div style="text-align: center; padding: 80px 0;">
            <div style="font-size: 24px;">📍</div>
            <div>Location: ${lat}, ${lon}</div>
          </div>
        `;
        
        showToast("Location updated");
        
        // Add notification
        addNotification("Pet location updated");
      }, err => {
        showToast("Error getting location. Please check permissions.");
      });
    } else {
      showToast("Geolocation not supported on this device.");
    }
  }
  
  // Setup geofence
  function setupGeofence() {
    showToast("Setting up safe zone...");
    setTimeout(() => {
      showToast("Safe zone created! You'll be notified if your pet leaves this area.");
      addNotification("Safe zone created around current location");
    }, 1500);
  }
  
  // Trigger background sync
  function syncData() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.sync.register('sync-pets')
          .then(() => {
            showToast("Pet data will sync when online");
          })
          .catch(err => {
            console.error('Sync registration failed:', err);
            showToast("Sync failed. Try again later.");
          });
      });
    } else {
      // Fallback for browsers that don't support background sync
      setTimeout(() => {
        showToast("Data synced successfully");
        document.getElementById('activity-placeholder').innerHTML = `
          <div style="text-align: center; padding: 50px 0;">
            <div>Activity data updated</div>
            <div style="font-size: 14px; color: #888; margin-top: 10px;">Last sync: ${new Date().toLocaleTimeString()}</div>
          </div>
        `;
        addNotification("Pet activity data synced");
      }, 1500);
    }
  }
  
  // Share activity
  function shareActivity() {
    if (navigator.share) {
      navigator.share({
        title: 'Pet Activity Report',
        text: 'Check out my pet\'s activity today: 1.2km walked, 32 minutes active!',
        url: window.location.href
      })
      .then(() => showToast('Shared successfully'))
      .catch((error) => showToast('Error sharing: ' + error));
    } else {
      showToast('Web Share API not supported in your browser');
    }
  }
  
  // Open camera
  function openCamera() {
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
      showToast("Requesting camera access...");
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          showToast("Camera accessed! This is a demo only.");
          // In a real app, we would display the camera stream
          stream.getTracks().forEach(track => track.stop());
          addNotification("New pet photo taken");
        })
        .catch(err => {
          showToast("Camera access denied or error occurred");
        });
    } else {
      showToast("Camera not supported in your browser");
    }
  }
  
  // Toggle AR view
  function toggleAR() {
    const arOverlay = document.getElementById('ar-overlay');
    if (arOverlay.style.display === 'flex') {
      arOverlay.style.display = 'none';
    } else {
      arOverlay.style.display = 'flex';
      showToast("AR mode activated (demo)");
    }
  }
  
  // Setup tabs
  function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Show selected tab content
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(`${tabName}-content`).classList.add('active');
      });
    });
  }
  
  // Simulate weather data
  function simulateWeather() {
    const weatherInfo = document.getElementById('weather-info');
    const temp = Math.floor(Math.random() * 10) + 15; // Random temp between 15-25
    const descriptions = ['Sunny', 'Partly Cloudy', 'Light Rain', 'Clear'];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    weatherInfo.innerHTML = `
      <div class="weather-temp">${temp}°C</div>
      <div class="weather-desc">${description}</div>
      <div style="margin-top: 5px;">Perfect for a walk!</div>
    `;
  }
  
  // Refresh weather
  function refreshWeather() {
    showToast("Refreshing weather...");
    setTimeout(() => {
      simulateWeather();
      showToast("Weather updated!");
    }, 1000);
  }
  
  // Save pet profile
  function savePetProfile() {
    const name = document.getElementById('petName').value;
    const type = document.getElementById('petType').value;
    const age = document.getElementById('petAge').value;
    
    if (name && age) {
      document.querySelector('.pet-name').textContent = name;
      
      let petTypeText = 'Pet';
      let petEmoji = '🐾';
      
      switch(type) {
        case 'dog':
          petTypeText = 'Dog';
          petEmoji = '🐕';
          break;
        case 'cat':
          petTypeText = 'Cat';
          petEmoji = '🐈';
          break;
        case 'bird':
          petTypeText = 'Bird';
          petEmoji = '🦜';
          break;
        default:
          petTypeText = 'Pet';
          petEmoji = '🐾';
      }
      
      document.querySelector('.pet-info').textContent = `${petTypeText} • ${age} years old`;
      document.querySelector('.pet-avatar div').textContent = petEmoji;
      
      showToast("Pet profile saved!");
    } else {
      showToast("Please fill in all fields");
    }
  }
  
  // Setup color theme options
  function setupColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Apply color theme
        const color = option.getAttribute('data-color');
        document.documentElement.style.setProperty('--theme-color', color);
        document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
        
        showToast("Theme color updated!");
      });
    });
  }
  
  // Setup install button
  function setupInstallButton() {
    let deferredPrompt;
    const installButton = document.getElementById('install-button');
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Show the install button
      installButton.style.display = 'flex';
      
      installButton.addEventListener('click', () => {
        // Hide the app provided install promotion
        installButton.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            showToast("Thanks for installing PetTracker!");
          } else {
            console.log('User dismissed the install prompt');
            installButton.style.display = 'flex';
          }
          deferredPrompt = null;
        });
      });
    });
  }
  
  // Initialize the app when the document is loaded
  document.addEventListener('DOMContentLoaded', initApp);
  
  // Load theme color from localStorage if available
  if (localStorage.getItem('themeColor')) {
    const savedColor = localStorage.getItem('themeColor');
    document.documentElement.style.setProperty('--theme-color', savedColor);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', savedColor);
  }