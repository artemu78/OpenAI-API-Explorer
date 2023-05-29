const MENU_ITEM_PREFIX = "openaiapiexp";
const PROMPT_STUB = "<<prompt>>";

// Define the menu items
const menuItems = [
  { id: `${MENU_ITEM_PREFIX}Parent`, title: "OpenAI API Explorer" },
  // {
  //   id: `openaiapiWAIT`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Wait",
  // },
  // {
  //   id: `openaiapiERROR`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Error",
  // },
  // {
  //   id: `openaiapiSAMPLE`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Sample",
  // },
  {
    id: `${MENU_ITEM_PREFIX}child1`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Summarize",
    config: {
      model: "text-davinci-003",
      prompt: `Summarize this for a second-grade student:\n\n${PROMPT_STUB}`,
      temperature: 0.7,
      max_tokens: 264,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  {
    id: `${MENU_ITEM_PREFIX}answer`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Answer the question",
    config: {
      model: "text-davinci-003",
      prompt: `Answer the question please:\n\n${PROMPT_STUB}`,
      temperature: 0.7,
      max_tokens: 264,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  {
    id: `${MENU_ITEM_PREFIX}child2`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Grammar correction",
    config: {
      model: "text-davinci-003",
      prompt: `Correct this to standard English:\n\n${PROMPT_STUB}`,
      temperature: 0,
      max_tokens: 260,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  {
    id: `${MENU_ITEM_PREFIX}child3`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Extract keywords",
    config: {
      model: "text-davinci-003",
      prompt: `Extract keywords from this text:\n\n${PROMPT_STUB}`,
      temperature: 0.5,
      max_tokens: 260,
      top_p: 1.0,
      frequency_penalty: 0.8,
      presence_penalty: 0.0,
    },
  },
  {
    id: `${MENU_ITEM_PREFIX}child4`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "TL;DR summarization",
    config: {
      model: "text-davinci-003",
      prompt: `${PROMPT_STUB}\n\nTl;dr`,
      temperature: 0.7,
      max_tokens: 260,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 1,
    },
  },
  {
    id: `${MENU_ITEM_PREFIX}child5`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Analogy maker",
    config: {
      model: "text-davinci-003",
      prompt: `Create an analogy for this phrase:\n\n${PROMPT_STUB}`,
      temperature: 0.5,
      max_tokens: 260,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  // {
  //   id: `${MENU_ITEM_PREFIX}child6`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 6",
  // },
  // {
  //   id: `${MENU_ITEM_PREFIX}child7`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 7",
  // },
];

const fetchConfig = (findMenuId, prompt) => {
  const { config } = menuItems.filter(({ id }) => id === findMenuId)[0];
  config.prompt = config.prompt.replace(PROMPT_STUB, prompt);
  return config;
};

// Function to create a menu item
function createMenuItem(item) {
  chrome.contextMenus.create(
    {
      id: item.id,
      parentId: item.parentId,
      title: item.title,
      contexts: ["selection"],
    },
    function () {
      // Check for any errors
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    }
  );
}

try {
  chrome.runtime.onInstalled.addListener(function () {
    // Create the menu items
    for (var i = 0; i < menuItems.length; i++) {
      createMenuItem(menuItems[i]);
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openaiapiWAIT") {
      chrome.tabs.sendMessage(tab.id, { openaiapiWAIT: true });
    }
    if (info.menuItemId === "openaiapiERROR") {
      chrome.tabs.sendMessage(tab.id, {
        openaiapiERROR: "Something goes wrong",
      });
    }
    if (info.menuItemId === "openaiapiSAMPLE") {
      chrome.tabs.sendMessage(tab.id, {
        summary: "Lorem ipsum dolor sit amet",
      });
    }
    if (info.menuItemId.startsWith(MENU_ITEM_PREFIX)) {
      chrome.storage.sync.get(
        {
          openAIKey: "",
        },
        function (items) {
          if (!items.openAIKey) {
            chrome.tabs.sendMessage(tab.id, {
              openaiapiERROR: "Please set OPEN AI KEY in extension options",
            });
            return;
          }
          chrome.tabs.sendMessage(tab.id, { openaiapiWAIT: true });
          const requestBody = fetchConfig(info.menuItemId, info.selectionText);
          fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + items.openAIKey,
            },
            body: JSON.stringify(requestBody),
          })
            .then((response) => {
              if (!response.ok) {
                console.log("response is broken", response);
                throw new Error(
                  `Network response was not ok. Response status ${response.status}`
                );
              }
              return response.json();
            })
            .then((data) => {
              chrome.tabs.sendMessage(tab.id, {
                summary: data.choices[0].text.trim(),
              });
            })
            .catch((error) => {
              chrome.tabs.sendMessage(tab.id, {
                openaiapiERROR: error.message,
              });
              console.error("Error:", error.message);
            });
        }
      );
    }
  });
} catch (e) {
  console.log("ChatGPT summarizer service worker error", e);
}
