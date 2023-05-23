const MENU_ITEM_PREFIX = "openaiapiexp";
const PROMPT_STUB = "<<prompt>>";

// Define the menu items
const menuItems = [
  { id: `${MENU_ITEM_PREFIX}Parent`, title: "OpenAI API Explorer" },
  {
    id: `${MENU_ITEM_PREFIX}child1`,
    parentId: `${MENU_ITEM_PREFIX}Parent`,
    title: "Summarize",
    config: {
      model: "text-davinci-003",
      prompt: `Summarize this for a second-grade student:\n\n${PROMPT_STUB}`,
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  // {
  //   id: `${MENU_ITEM_PREFIX}child2`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 2",
  // },
  // {
  //   id: `${MENU_ITEM_PREFIX}child3`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 3",
  // },
  // {
  //   id: `${MENU_ITEM_PREFIX}child4`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 4",
  // },
  // {
  //   id: `${MENU_ITEM_PREFIX}child5`,
  //   parentId: `${MENU_ITEM_PREFIX}Parent`,
  //   title: "Child 5",
  // },
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
    if (info.menuItemId.startsWith(MENU_ITEM_PREFIX)) {
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
    }
  });
} catch (e) {
  console.log("ChatGPT summarizer service worker error", e);
}
