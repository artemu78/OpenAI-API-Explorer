document.addEventListener("DOMContentLoaded", function () {
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get(
      {
        openAIKey: "",
        theme: "",
        maxTokens,
      },
      function (items) {
        document.getElementById("apiKey").value = items.openAIKey;
        document.getElementById("theme").value = items.theme;
        document.getElementById("maxTokens").value = items.maxTokens || 1000;
      }
    );
  }
  restore_options();

  // Saves options to chrome.storage
  function save_options() {
    let theme = document.getElementById("theme").value;
    let apiKey = document.getElementById("apiKey").value;
    let maxTokens = document.getElementById("maxTokens").value;
    const saveObject = {
      openAIKey: apiKey,
      theme,
      maxTokens,
    };

    chrome.storage.sync.set(saveObject, function () {
      // Update status to let user know options were saved.
      let status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 3000);
    });
  }

  document.getElementById("saveButton").addEventListener("click", save_options);
});
