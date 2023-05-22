try {
  chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
      id: "summarize",
      title: "Summarize with ChatGPT",
      contexts: ["selection"],
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize") {
      const sText = info.selectionText;
      if (sText) {
        chrome.storage.sync.get(
          {
            openAIKey: "",
          },
          function (items) {
            if (!items.openAIKey) {
              chrome.tabs.sendMessage(tab.id, {
                summary: "Please set OPEN AI KEY in extension options",
              });
              return;
            }
            fetch("https://api.openai.com/v1/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + items.openAIKey,
              },
              body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Summarize this for a second-grade student:\n\n${sText}`,
                temperature: 0.7,
                max_tokens: 64,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.log("response is broken", response);
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((data) => {
                chrome.tabs.sendMessage(tab.id, {
                  summary: data.choices[0].text.trim(),
                });
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        );
      } else {
        console.log("ChatGPT summarize",  "no selected text");
      }
    }
  });
} catch (e) {
  console.log("ChatGPT summarizer service worker error", e);
}
