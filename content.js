var openaiapiexpPopup = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.summary) showResponseModal(request.summary);
  if (request.openaiapiWAIT) showWaitModal();
  if (request.openaiapiERROR) showErrorModal(request.openaiapiERROR);
  if (request.openaiapiexpPopover) {
    showPopover(request.openaiapiexpPopup, sendResponse);
    return true;
  }
});

function showPopover(message, sendResponse) {
    // Create the modal div and set its class
    var modal = document.createElement('div');
    modal.setAttribute('class', 'openapiexpPopover');
    modal.setAttribute('id', 'openapiexpPopover');
  
    // Create the modal content div
    var modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'openapiexpPopoverContent');
  
    // Create the close button and set its content
    var closeButton = document.createElement('span');
    closeButton.setAttribute('class', 'openapiexpPopoverClose');
    closeButton.innerHTML = '&times;';
  
    // Create the input field for the question
    var questionInput = document.createElement('input');
    questionInput.setAttribute('type', 'text');
    questionInput.classList.add("openapiexpControls");
    questionInput.classList.add("openapiexpPopoverInput");
    questionInput.setAttribute('placeholder', 'Your question...');
  
    // Create the "Ask" button
    var askButton = document.createElement('button');
    askButton.classList.add("openapiexpControls");
    askButton.textContent = 'Send question';
  
    // Create the "Cancel" button
    var cancelButton = document.createElement('button');
    cancelButton.classList.add("openapiexpControls");
    cancelButton.textContent = 'Cancel';
  
    // Append the elements to the modal content div
    modalContent.appendChild(closeButton);
    modalContent.appendChild(questionInput);
    modalContent.appendChild(askButton);
    modalContent.appendChild(cancelButton);
  
    // Append the modal content div to the modal div
    modal.appendChild(modalContent);
  
    // Append the modal div to the body
    document.body.appendChild(modal);
  
    // Event listeners for buttons and closing the modal
    closeButton.onclick = function() {
      sendResponse({response: ""});
      document.getElementById("openapiexpPopover")?.remove();
    };
  
    cancelButton.onclick = function() {
      sendResponse({response: ""});
      document.getElementById("openapiexpPopover")?.remove();
    };

    askButton.onclick = function () {
      sendResponse({response: questionInput.value});
      document.getElementById("openapiexpPopover")?.remove();
    }
  
    window.onclick = function(event) {
      if (event.target == modal) {
        document.getElementById("openapiexpPopover")?.remove();
      }
    };
}

function showWaitModal() {
  let popup = createModal({ x: "150px", y: "150px" });
  let spinner = document.createElement("div");
  spinner.classList.add("openaiapiexploader");
  popup.appendChild(spinner);
}

function showErrorModal(message) {
  const popup = createModalWithButton({ x: "400px", y: "300px" });
  popup.classList.add("openaiapiexperror");
  const contentElement = document.createElement("div");
  contentElement.textContent = message;
  popup.insertBefore(contentElement, popup.firstChild);
}

function showResponseModal(message) {
  const popup = createModalWithButton({ x: "400px", y: "200px" });
  const contentElement = document.createElement("div");
  contentElement.textContent = message;
  popup.insertBefore(contentElement, popup.firstChild);
}

function createModalWithButton(size) {
  let popup = createModal(size);

  // Add a close button to the popup
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.display = "block";
  closeButton.style.marginTop = "10px";
  closeButton.onclick = function () {
    document.body.removeChild(popup);
  };
  popup.appendChild(closeButton);
  closeButton.focus();
  return popup;
}

function createModal(size) {
  if (openaiapiexpPopup) openaiapiexpPopup.remove();

  // Create a new div element for the popup
  openaiapiexpPopup = document.createElement("div");

  // Add some basic styling to the popup
  openaiapiexpPopup.style.position = "fixed";
  openaiapiexpPopup.style.bottom = "0";
  openaiapiexpPopup.style.right = "0";
  openaiapiexpPopup.style.border = "1px solid #ced4da";
  openaiapiexpPopup.style.padding = "10px";
  openaiapiexpPopup.style.zIndex = "10000";
  openaiapiexpPopup.style.maxHeight = size.y;
  openaiapiexpPopup.style.maxWidth = size.x;
  openaiapiexpPopup.style.overflow = "auto";

  chrome.storage.sync.get("theme", function (data) {
    var theme = data.theme || "light";
    // var style = document.getElementById('theme');
    if (theme === "dark") {
      openaiapiexpPopup.style.backgroundColor = "#333";
      openaiapiexpPopup.style.color = "#eee";
    } else {
      openaiapiexpPopup.style.backgroundColor = "#f8f9fa";
      openaiapiexpPopup.style.color = "#333";
    }
  });

  // Add the popup to the body of the webpage
  document.body.appendChild(openaiapiexpPopup);
  return openaiapiexpPopup;
}

var style = document.createElement("style");
style.type = "text/css";
let keyFrames =
  "\
:root {\
  --openaiexp-background-color: #fefefe;\
  --openaiexp-color: rgb(35, 39, 47);\
}\
@media (prefers-color-scheme: dark) {\
  :root {\
    --openaiexp-background-color: #23272f;\
    --openaiexp-color: rgb(235, 236, 240);\
  }\
}\
.openaiapiexploader {\
  margin: auto;\
  border: 8px solid #EAF0F6;\
  border-radius: 50%;\
  border-top: 8px solid #FF7A59;\
  width: 50px;\
  height: 50px;\
  animation: spinner 4s linear infinite;\
}\
@keyframes spinner {\
  0% { transform: rotate(0deg); }\
  100% { transform: rotate(360deg); }\
}\
\
.openaiapiexperror {\
  color: #721c24;\
  background-color: #f8d7da !important;\
  border-color: #f5c6cb !important;\
}\
\
.openapiexpPopover {\
  position: fixed;\
  z-index: 100;\
  left: 0;\
  top: 0;\
  width: 100%;\
  height: 100%;\
  overflow: auto;\
  background-color: rgb(0,0,0);\
  background-color: rgba(0,0,0,0.4);\
}\
\
.openapiexpPopoverContent {\
  background-color: var(--openaiexp-background-color);\
  margin: 15% auto; \
  padding: 20px;\
  border: 1px solid #888;\
  width: 50%; \
}\
\
.openapiexpPopoverClose {\
  color: #aaa;\
  float: right;\
  font-size: 28px;\
  font-weight: bold;\
}\
.openapiexpPopoverInput {\
  width: 100%;\
  display: block;\
}\
.openapiexpControls {\
  border: 1px solid lightgray;\
  padding: 5px;\
  border-radius: 5px;\
  margin: 10px;\
  color: var(--openaiexp-color);\
  background-color: var(--openaiexp-background-color);\
}\
\
.openapiexpPopoverClose:hover,\
.openapiexpPopoverClose:focus {\
  color: black;\
  cursor: pointer;\
}\
";
style.innerHTML = keyFrames;
document.getElementsByTagName("head")[0].appendChild(style);
