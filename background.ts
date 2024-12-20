import {
  MENU_ITEM_PREFIX,
  SELECTED_TEXT,
  USER_QUESTION,
  menuItems,
} from "./menu";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const LAMBDA_URL =
  "https://ou52argaoqotzii5uults2o4wa0vafjw.lambda-url.us-east-1.on.aws/";

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
  const configResult = { messages: [], ...config };
  if (configResult) {
    configResult.messages[0].content = configResult.messages[0].content.replace(
      SELECTED_TEXT,
      selectionText
    );
    configResult.messages[0].content = configResult.messages[0].content.replace(
      USER_QUESTION,
      additionalInfo?.response
    );
  }

  ["menuitem1", "menuitem2"].forEach((menuItemId: string) => {
    if (findMenuId === `${MENU_ITEM_PREFIX}${menuItemId}` && configResult) {
      configResult.messages[0].content =
        items[menuItemId] + "\n\n" + selectionText;
    }
  });
  return configResult;
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
    token: "",
    email: "",
    tokenTimestamp: 0,
  });

  if (!items.openAIKey && !items.token) {
    chrome.tabs.sendMessage(tabId, {
      openaiapiERROR:
        "Please set OPENAI KEY in the extension options, please find instructions in option window",
    });
    return;
  }
  chrome.tabs.sendMessage(tabId, { openaiapiWAIT: true });

  const requestBody = fetchConfig(
    info.menuItemId.toString(),
    info.selectionText || "",
    { ...items }, //items itself should be immutable
    additionalData
  );

  requestBody &&
    items.maxTokens &&
    (requestBody.max_tokens = parseInt(items.maxTokens));
  requestBody && items.model && (requestBody.model = items.model);

  let authToken, url;
  if (items.token) {
    authToken = items.token;
    url = LAMBDA_URL;
    if (Date.now() - items.tokenTimestamp > 5 * 60 * 1000) {
      // token is older than 5 minutes and we need to refresh it
      authToken = await login(false);
      chrome.storage.sync.set({ token: authToken, tokenTimestamp: Date.now() });
    }
  } else {
    authToken = items.openAIKey;
    url = OPENAI_URL;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    console.log("response is broken", response);
    chrome.tabs.sendMessage(tabId, {
      openaiapiERROR: `Network response was not ok. Response status ${response.status}`,
    });
  }
  const data = await response.json();
  chrome.tabs.sendMessage(tabId, {
    summary:
      (data?.choices[0]?.message?.content?.trim() || "") +
      (data?.choices[0]?.message?.refusal?.trim() || ""),
  });
}

try {
  chrome.runtime.onInstalled.addListener(function () {
    // Create the menu items
    for (var i = 0; i < menuItems.length; i++) {
      createMenuItem(menuItems[i]);
    }
    chrome.runtime.setUninstallURL("https://www.surveymonkey.com/r/QXKXQML");
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

function login(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(token);
    });
  });
}
