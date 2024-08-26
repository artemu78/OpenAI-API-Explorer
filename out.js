"use strict";
(() => {
  // menu.ts
  var MENU_ITEM_PREFIX = "openaiapiexp";
  var PROMPT_STUB = "<<prompt>>";
  var menuItems = [
    {
      id: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "OpenAI API Explorer"
    },
    // {
    //   id: `openaiapiWAIT`,
    //   parentId: `${MENU_ITEM_PREFIX}Parent`,
    //   visible: true, 
    //   title: "Wait",
    // },
    // {
    //   id: `openaiapiERROR`,
    //   parentId: `${MENU_ITEM_PREFIX}Parent`,
    //   visible: true, 
    // title: "Error",
    // },
    // {
    //   id: `openaiapiSAMPLE`,
    //   parentId: `${MENU_ITEM_PREFIX}Parent`,
    //   visible: true, 
    // title: "Sample",
    // },
    {
      id: `${MENU_ITEM_PREFIX}child1`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Summarize",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Summarize this for a second-grade student:

${PROMPT_STUB}` }],
        temperature: 0.7,
        max_tokens: 264,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}answer`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Answer the question",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Answer the question please:

${PROMPT_STUB}` }],
        temperature: 0.7,
        max_tokens: 264,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}child2`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Grammar correction",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Correct this to standard English:

${PROMPT_STUB}` }],
        temperature: 0,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}child3`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Extract keywords",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Extract keywords from this text:

${PROMPT_STUB}` }],
        temperature: 0.5,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0.8,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}child4`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "TL;DR summarization",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `${PROMPT_STUB}

Tl;dr` }],
        temperature: 0.7,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 1
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}child5`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Analogy maker",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Create an analogy for this phrase:

${PROMPT_STUB}` }],
        temperature: 0.5,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}menuitem1`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: false,
      title: "Custom item 1",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `` }],
        temperature: 0.5,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0.8,
        presence_penalty: 0
      }
    },
    {
      id: `${MENU_ITEM_PREFIX}menuitem2`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: false,
      title: "Custom item 2",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `` }],
        temperature: 0.5,
        max_tokens: 260,
        top_p: 1,
        frequency_penalty: 0.8,
        presence_penalty: 0
      }
    }
    // {
    //   id: `${MENU_ITEM_PREFIX}child6`,
    //   parentId: `${MENU_ITEM_PREFIX}Parent`,
    //   visible: true, 
    // title: "Child 6",
    // },
    // {
    //   id: `${MENU_ITEM_PREFIX}child7`,
    //   parentId: `${MENU_ITEM_PREFIX}Parent`,
    //   visible: true, 
    // title: "Child 7",
    // },
  ];

  // background.ts
  var OPENAI_URL = "https://api.openai.com/v1/chat/completions";
  var fetchConfig = (findMenuId, selectionText, items) => {
    const { config } = menuItems.filter(({ id }) => id === findMenuId)[0];
    config && (config.messages[0].content = config.messages[0].content.replace(
      PROMPT_STUB,
      selectionText
    ));
    ["menuitem1", "menuitem2"].forEach((menuItemId) => {
      if (findMenuId === `${MENU_ITEM_PREFIX}${menuItemId}` && config) {
        config.messages[0].content = items[menuItemId] + "\n\n" + selectionText;
      }
    });
    return config;
  };
  function createMenuItem(item) {
    chrome.contextMenus.create(
      {
        id: item.id,
        parentId: item.parentId,
        title: item.title,
        contexts: ["selection"],
        visible: item.visible
      },
      function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      }
    );
  }
  try {
    chrome.runtime.onInstalled.addListener(function() {
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
          openaiapiERROR: "Something goes wrong"
        });
      }
      if (info.menuItemId === "openaiapiSAMPLE") {
        chrome.tabs.sendMessage(tabId, {
          summary: "Lorem ipsum dolor sit amet"
        });
      }
      if (info.menuItemId.toString().startsWith(MENU_ITEM_PREFIX)) {
        const items = await chrome.storage.sync.get({
          openAIKey: "",
          maxTokens: 1e3,
          model: "gpt-4o-mini",
          menuitem1: "",
          menuitem2: ""
        });
        if (!items.openAIKey) {
          chrome.tabs.sendMessage(tabId, {
            openaiapiERROR: "Please set OPEN AI KEY in the extension options, please find instructions in option window"
          });
          return;
        }
        chrome.tabs.sendMessage(tabId, { openaiapiWAIT: true });
        const requestBody = fetchConfig(
          info.menuItemId.toString(),
          info.selectionText || "",
          items
        );
        requestBody && items.maxTokens && (requestBody.max_tokens = parseInt(items.maxTokens));
        requestBody && items.model && (requestBody.model = items.model);
        fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + items.openAIKey
          },
          body: JSON.stringify(requestBody)
        }).then((response) => {
          if (!response.ok) {
            console.log("response is broken", response);
            throw new Error(
              `Network response was not ok. Response status ${response.status}`
            );
          }
          return response.json();
        }).then((data) => {
          chrome.tabs.sendMessage(tabId, {
            summary: (data?.choices[0]?.message?.content?.trim() || "") + (data?.choices[0]?.message?.refusal?.trim() || "")
          });
        }).catch((error) => {
          chrome.tabs.sendMessage(tabId, {
            openaiapiERROR: error.message
          });
          console.error("Fetch error:", error.message);
        });
      }
    });
  } catch (e) {
    console.log("ChatGPT summarizer service worker error", e);
  }
})();
