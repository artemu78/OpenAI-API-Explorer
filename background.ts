import {
  MENU_ITEM_PREFIX,
  SELECTED_TEXT,
  USER_QUESTION,
  menuItems,
} from "./menu";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
type Items = {
  [key: string]: any;
};

const fetchConfig = (
  findMenuId: string,
  selectionText: string,
  items: Items,
  additionalInfo?: any
) => {
  const { config } = menuItems.filter(({ id }) => id === findMenuId)[0];
  if (config) {
    config.messages[0].content = config.messages[0].content.replace(
      SELECTED_TEXT,
      selectionText
    );
    config.messages[0].content = config.messages[0].content.replace(
      USER_QUESTION,
      additionalInfo?.response
    );
  }

  ["menuitem1", "menuitem2"].forEach((menuItemId: string) => {
    if (findMenuId === `${MENU_ITEM_PREFIX}${menuItemId}` && config) {
      config.messages[0].content = items[menuItemId] + "\n\n" + selectionText;
    }
  });
  return config;
};

// Function to create a menu item
function createMenuItem(item: any) {
  chrome.contextMenus.create(
    {
      id: item.id,
      parentId: item.parentId,
      title: item.title,
      contexts: ["selection"],
      visible: item.visible,
    },
    function () {
      // Check for any errors
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    }
  );
}

async function sendOpenAIRequest(
  tabId: number,
  info: chrome.contextMenus.OnClickData,
  additionalData?: any
) {
  const items = await chrome.storage.sync.get({
    openAIKey: "",
    maxTokens: 1000,
    model: "gpt-4o-mini",
    menuitem1: "",
    menuitem2: "",
  });
  if (!items.openAIKey) {
    chrome.tabs.sendMessage(tabId, {
      openaiapiERROR:
        "Please set OPEN AI KEY in the extension options, please find instructions in option window",
    });
    return;
  }
  chrome.tabs.sendMessage(tabId, { openaiapiWAIT: true });

  const requestBody = fetchConfig(
    info.menuItemId.toString(),
    info.selectionText || "",
    items,
    additionalData
  );

  requestBody &&
    items.maxTokens &&
    (requestBody.max_tokens = parseInt(items.maxTokens));
  requestBody && items.model && (requestBody.model = items.model);

  fetch(OPENAI_URL, {
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
      chrome.tabs.sendMessage(tabId, {
        summary:
          (data?.choices[0]?.message?.content?.trim() || "") +
          (data?.choices[0]?.message?.refusal?.trim() || ""),
      });
    })
    .catch((error) => {
      chrome.tabs.sendMessage(tabId, {
        openaiapiERROR: error.message,
      });
      console.error("Fetch error:", error.message);
    });
}

try {
  chrome.runtime.onInstalled.addListener(function () {
    // Create the menu items
    for (var i = 0; i < menuItems.length; i++) {
      createMenuItem(menuItems[i]);
    }
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const tabId = tab?.id || 0;
    if (info.menuItemId === "openaiapiWAIT") {
      chrome.tabs.sendMessage(tabId, { openaiapiWAIT: true });
    }
    if (info.menuItemId === "openaiapiERROR") {
      chrome.tabs.sendMessage(tabId, {
        openaiapiERROR: "Something goes wrong",
      });
    }
    if (info.menuItemId === "openaiapiAsk") {
      chrome.tabs.sendMessage(
        tabId,
        {
          openaiapiexpPopover: {},
        },
        (response) => {
          info.menuItemId = `${MENU_ITEM_PREFIX}openaiapiAsk`;
          response?.response && sendOpenAIRequest(tabId, info, response);
        }
      );
    }
    if (info.menuItemId.toString().startsWith(MENU_ITEM_PREFIX)) {
      sendOpenAIRequest(tabId, info);
    }
  });
} catch (e) {
  console.log("ChatGPT summarizer service worker error", e);
}
