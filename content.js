var openaiapiexpPopup = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.summary) showResponseModal(request.summary);
  if (request.openaiapiWAIT) showWaitModal();
  if (request.openaiapiERROR) showErrorModal(request.openaiapiERROR);
});

function showWaitModal() {
  let popup = createModal({ x: "150px", y: "150px" });
  let spinner = document.createElement("div");
  spinner.classList.add("openaiapiexploader");
  popup.appendChild(spinner);
}

function showErrorModal(message) {
  const popup = createModalWithButton({ x: "400px", y: "300px" });
  popup.classList.add("error");
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
.error {\
  color: #721c24;\
  background-color: #f8d7da !important;\
  border-color: #f5c6cb !important;\
}\
";
style.innerHTML = keyFrames;
document.getElementsByTagName("head")[0].appendChild(style);
