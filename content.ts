type Size = {
  x: string;
  y: string;
};
type SendResponse = (response?: any) => void;

var openaiapiexpPopup: HTMLDivElement | null = null;

// Reference-counting system for body scroll management
var bodyScrollCounter: number = 0;
var originalBodyOverflow: string | null = null;

function disableBodyScroll() {
  bodyScrollCounter++;
  if (bodyScrollCounter === 1) {
    // First modal opening - save original overflow and disable scroll
    originalBodyOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
  }
}

function enableBodyScroll() {
  if (bodyScrollCounter > 0) {
    bodyScrollCounter--;
    if (bodyScrollCounter === 0) {
      // Last modal closed - restore original overflow
      if (originalBodyOverflow !== null) {
        document.body.style.overflow = originalBodyOverflow;
        originalBodyOverflow = null;
      } else {
        document.body.style.overflow = "";
      }
    }
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.summary) showResponseModal(request.summary, request.requestPrice);
  if (request.openaiapiWAIT) showWaitModal();
  if (request.openaiapiERROR) showErrorModal(request.openaiapiERROR);
  if (request.openaiapiexpPopover) {
    showPopover(request.openaiapiexpPopup, sendResponse);
    return true;
  }
});

function showPopover(message: string, sendResponse: SendResponse) {
  // Disable body scroll when opening popover
  disableBodyScroll();

  // Create the modal div and set its class
  var modal = document.createElement("div");
  modal.setAttribute("class", "openapiexpPopover");
  modal.setAttribute("id", "openapiexpPopover");

  // Create the modal content div
  var modalContent = document.createElement("div");
  modalContent.setAttribute("class", "openapiexpPopoverContent");

  // Create the close button and set its content
  var closeButton = document.createElement("span");
  closeButton.setAttribute("class", "openapiexpPopoverClose");
  closeButton.innerHTML = "&times;";

  // Create the input field for the question
  var questionInput = document.createElement("input");
  questionInput.setAttribute("type", "text");
  questionInput.classList.add("openapiexpControls");
  questionInput.classList.add("openapiexpPopoverInput");
  questionInput.setAttribute("placeholder", "Your question...");

  // Create the "Ask" button
  var askButton = document.createElement("button");
  askButton.classList.add("openapiexpControls");
  askButton.textContent = "Send question";

  // Create the "Cancel" button
  var cancelButton = document.createElement("button");
  cancelButton.classList.add("openapiexpControls");
  cancelButton.textContent = "Cancel";

  // Append the elements to the modal content div
  modalContent.appendChild(closeButton);
  modalContent.appendChild(questionInput);
  modalContent.appendChild(askButton);
  modalContent.appendChild(cancelButton);

  // Append the modal content div to the modal div
  modal.appendChild(modalContent);

  // Append the modal div to the body
  document.body.appendChild(modal);

  // Helper function to close popover and restore scroll
  function closePopover() {
    document.getElementById("openapiexpPopover")?.remove();
    enableBodyScroll();
  }

  // Event listeners for buttons and closing the modal
  closeButton.onclick = function () {
    sendResponse({ response: "" });
    closePopover();
  };

  cancelButton.onclick = function () {
    sendResponse({ response: "" });
    closePopover();
  };

  askButton.onclick = function () {
    sendResponse({ response: questionInput.value });
    closePopover();
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      closePopover();
    }
  };
}

function showWaitModal() {
  let popup = createModal({ x: "150px", y: "150px" });
  // Prevent scrollbars from appearing during spinner animation
  popup.style.overflow = "hidden";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  let spinner = document.createElement("div");
  spinner.classList.add("openaiapiexploader");
  popup.appendChild(spinner);
}

function showErrorModal(message: string) {
  const popup = createModalWithButton({ x: "400px", y: "300px" }, message);
  popup.classList.add("openaiapiexperror");
}

function addTextToPopup(message: string, popup: HTMLDivElement) {
  const contentElement = document.createElement("div");
  contentElement.classList.add("openapiexpResponseContent");
  contentElement.innerHTML = message;
  popup.insertBefore(contentElement, popup.firstChild);
}

function showResponseModal(message: string, requestPrice: number) {
  const popup = createModalWithButton(
    { x: "400px", y: "200px" },
    message,
    requestPrice
  );
}

function appendPriceString(requestPrice: number, popup: HTMLDivElement) {
  const priceElement = document.createElement("div");
  priceElement.classList.add("openapiexpResponsePrice");
  priceElement.innerHTML = `Price: $${requestPrice.toFixed(6)}`;
  popup.appendChild(priceElement);
}

function createModalWithButton(
  size: Size,
  message: string,
  requestPrice?: number
) {
  let popup = createModal(size);
  if (requestPrice) appendPriceString(requestPrice, popup);
  addTextToPopup(message, popup);
  appendCloseButton(popup);
  appendCopyButton(popup);
  return popup;
}

function appendCloseButton(popup: HTMLDivElement) {
  const closeButton = document.createElement("button");
  closeButton.classList.add("responseModalButton");
  closeButton.textContent = "Close";
  closeButton.onclick = function () {
    document.body.removeChild(popup);
    enableBodyScroll();
  };
  popup.appendChild(closeButton);
  closeButton.focus();
}

function appendCopyButton(popup: HTMLDivElement) {
  const contentElement = popup.querySelector(".openapiexpResponseContent");
  const copyButton = document.createElement("button");
  copyButton.classList.add("responseModalButton");
  copyButton.textContent = "Copy";
  copyButton.onclick = function () {
    navigator.clipboard.writeText(contentElement?.textContent || "");
    handleCopy(copyButton);
  };
  popup.appendChild(copyButton);
}

// Function to handle the copy click
function handleCopy(copyButton: HTMLButtonElement) {
  // Save the original button text
  const originalText = copyButton.textContent;

  // Change button text to show feedback
  copyButton.textContent = "Copied!";

  // Optional: add a success class for styling
  copyButton.classList.add("copy-success");

  // Reset button after 2 seconds
  setTimeout(() => {
    copyButton.textContent = originalText;
    copyButton.classList.remove("copy-success");
  }, 2000);
}

function createModal(size: Size) {
  if (openaiapiexpPopup) {
    enableBodyScroll();
    openaiapiexpPopup.remove();
  }

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
  // Disable body scroll when modal is shown
  disableBodyScroll();

  chrome.storage.sync.get("theme", function (data) {
    var theme = data.theme || "light";
    if (!openaiapiexpPopup) return;
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
  box-sizing: border-box;\
  flex-shrink: 0;\
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
\
.responseModalButton {\
  margin-right: 10px;\
  display: inline-block;\
  padding: 5px;\
  border-radius: 5px;\
}\
.openapiexpResponseContent p {\
  font-size: 1rem;\
  padding-bottom: 1rem;\
}\
.openapiexpResponsePrice {\
  font-size: 0.8rem;\
  padding-bottom: 1rem;\
  float: right;\
}\
";
style.innerHTML = keyFrames;
document.getElementsByTagName("head")[0].appendChild(style);
