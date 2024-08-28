"use strict";
(() => {
  // menu.ts
  var MENU_ITEM_PREFIX = "openaiapiexp";
  var SELECTED_TEXT = "<<selection>>";
  var USER_QUESTION = "<<user_question>>";
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
    {
      id: `${MENU_ITEM_PREFIX}child1`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Summarize",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Summarize this for a second-grade student:

${SELECTED_TEXT}` }],
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

${SELECTED_TEXT}` }],
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

${SELECTED_TEXT}` }],
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

${SELECTED_TEXT}` }],
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
        messages: [{ role: "user", content: `${SELECTED_TEXT}

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

${SELECTED_TEXT}` }],
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
    },
    {
      id: `openaiapiAsk`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: true,
      title: "Ask question about selected text"
    },
    {
      id: `${MENU_ITEM_PREFIX}openaiapiAsk`,
      parentId: `${MENU_ITEM_PREFIX}Parent`,
      visible: false,
      title: "Ask question about selected text",
      config: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `I'm going to provide a text excerpt below. Please read it carefully.
Text Excerpt: ${SELECTED_TEXT}
Based on the text provided, please answer the following question: ${USER_QUESTION}` }],
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

  // options.ts
  function FillElementsWithData(items) {
    document.getElementById("apiKey").value = items.openAIKey;
    document.getElementById("theme").value = items.theme || "light";
    document.getElementById("maxTokens").value = items.maxTokens || 1e3;
    document.getElementById("menuitem1").value = items.menuitem1 || "";
    document.getElementById("menuitem1name").value = items.menuitem1name || "";
    document.getElementById("menuitem2").value = items.menuitem2 || "";
    document.getElementById("menuitem2name").value = items.menuitem2name || "";
    document.getElementById("model").value = items.model || "gpt-4o-mini";
  }
  document.addEventListener("DOMContentLoaded", function() {
    function restore_options() {
      chrome.storage.sync.get(
        {
          openAIKey: "",
          theme: "",
          maxTokens: "",
          menuitem1: "",
          menuitem1name: "Custom item 1",
          menuitem2: "",
          menuitem2name: "Custom item 2",
          model: ""
        },
        FillElementsWithData
      );
    }
    restore_options();
    function ShowSaveSuccessStatus() {
      const status = document.getElementById("status");
      status && (status.textContent = "Options saved.");
      setTimeout(function() {
        status && (status.textContent = "");
      }, 3e3);
    }
    function save_options() {
      const theme = document.getElementById("theme").value;
      const openAIKey = document.getElementById("apiKey").value;
      const maxTokens = document.getElementById("maxTokens").value;
      const menuitem1 = document.getElementById("menuitem1").value;
      const menuitem1name = document.getElementById("menuitem1name").value;
      const menuitem2 = document.getElementById("menuitem2").value;
      const menuitem2name = document.getElementById("menuitem2name").value;
      const model = document.getElementById("model").value;
      const saveObject = {
        openAIKey,
        theme,
        maxTokens,
        menuitem1,
        menuitem1name,
        menuitem2,
        menuitem2name,
        model
      };
      chrome.storage.sync.set(saveObject, ShowSaveSuccessStatus);
      chrome.contextMenus.update(
        `${MENU_ITEM_PREFIX}menuitem1`,
        {
          visible: !!menuitem1,
          title: menuitem1name
        }
      );
      chrome.contextMenus.update(
        `${MENU_ITEM_PREFIX}menuitem2`,
        {
          visible: !!menuitem2,
          title: menuitem2name
        }
      );
    }
    function clear_options() {
      FillElementsWithData({
        openAIKey: "",
        theme: "",
        maxTokens: "",
        menuitem1: "",
        menuitem1name: "",
        menuitem2: "",
        menuitem2name: "",
        model: ""
      });
      chrome.storage.sync.clear();
    }
    document.getElementById("saveButton")?.addEventListener("click", save_options);
    document.getElementById("clearButton")?.addEventListener("click", clear_options);
  });
})();
