chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.summary) {
      alert(request.summary);
    }
  });
  