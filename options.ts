import { MENU_ITEM_PREFIX } from "./menu";

function FillElementsWithData(items: any) {
  (document.getElementById("apiKey") as HTMLInputElement).value = items.openAIKey;
  (document.getElementById("theme") as HTMLInputElement).value = items.theme || "light";
  (document.getElementById("maxTokens") as HTMLInputElement).value = items.maxTokens || 1000;
  (document.getElementById("menuitem1") as HTMLInputElement).value = items.menuitem1 || "";
  (document.getElementById("menuitem1name") as HTMLInputElement).value = items.menuitem1name || "";
  (document.getElementById("menuitem2") as HTMLInputElement).value = items.menuitem2 || "";
  (document.getElementById("menuitem2name") as HTMLInputElement).value = items.menuitem2name || "";
  (document.getElementById("model") as HTMLInputElement).value = items.model || "gpt-4o-mini";
}

document.addEventListener("DOMContentLoaded", function () {
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
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

  // Saves options to chrome.storage
  function save_options() {
    const theme = (document.getElementById("theme") as HTMLInputElement).value;
    const openAIKey = (document.getElementById("apiKey") as HTMLInputElement).value;
    const maxTokens = (document.getElementById("maxTokens") as HTMLInputElement).value;
    const menuitem1 = (document.getElementById("menuitem1") as HTMLInputElement).value;
    const menuitem1name = (document.getElementById("menuitem1name") as HTMLInputElement).value;
    const menuitem2 = (document.getElementById("menuitem2") as HTMLInputElement).value;
    const menuitem2name = (document.getElementById("menuitem2name") as HTMLInputElement).value;
    const model = (document.getElementById("model") as HTMLInputElement).value;
    const saveObject = {
      openAIKey,
      theme,
      maxTokens,
      menuitem1,
      menuitem1name,
      menuitem2,
      menuitem2name,
      model,
    };

    chrome.storage.sync.set(saveObject, function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status && (status.textContent = "Options saved.");
      setTimeout(function () {
        status && (status.textContent = "");
      }, 3000);
    });

    chrome.contextMenus.update(`${MENU_ITEM_PREFIX}menuitem1`,
      {
        visible: !!menuitem1,
        title: menuitem1name,
      }
    )

    chrome.contextMenus.update(`${MENU_ITEM_PREFIX}menuitem2`,
      {
        visible: !!menuitem2,
        title: menuitem2name
      }
    )
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
