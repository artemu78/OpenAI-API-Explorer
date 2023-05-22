document.addEventListener('DOMContentLoaded', function() {
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      openAIKey: ''
    }, function(items) {
      document.getElementById('apiKey').value = items.openAIKey;
    });
  }
  restore_options();

  // Saves options to chrome.storage
  function save_options() {
    var apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({
      openAIKey: apiKey
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }

  document.getElementById('saveButton').addEventListener('click', save_options);
});