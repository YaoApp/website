import "@assets/js/highlight.min.js";

const Message = {
  Info: (message) => {
    message = typeof message === "string" ? { message } : message;
    $("#message").trigger("show", [{ ...message, type: "info" }]);
  },
  Success: (message) => {
    message = typeof message === "string" ? { message } : message;
    $("#message").trigger("show", [{ ...message, type: "success" }]);
  },
  Warning: (message) => {
    message = typeof message === "string" ? { message } : message;
    $("#message").trigger("show", [{ ...message, type: "warning" }]);
  },
  Error: (message) => {
    message = typeof message === "string" ? { message } : message;
    $("#message").trigger("show", [{ ...message, type: "error" }]);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const message =
    window.location !== window.parent.location
      ? window.parent.Message
      : Message;

  // show maximize if page in iframe
  if (window.location !== window.parent.location) {
    const maximize = document.querySelector("[maximize]");
    maximize.classList.remove("hidden");
  }

  // Code Highlight
  document.querySelectorAll("pre").forEach((block) => {
    hljs.highlightElement(block);
  });

  // Tabs Interaction
  document.querySelectorAll("[tab]").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.target.getAttribute("data-link");
      const parent = e.target.closest(`[type="example"]`);

      const defaultClass = e.target.getAttribute("default-class").split(" ");
      const activeClass = e.target.getAttribute("active-class").split(" ");

      parent.querySelectorAll("[tab]").forEach((tab) => {
        activeClass.forEach((className) => tab.classList.remove(className));
        defaultClass.forEach((className) => tab.classList.add(className));
      });
      defaultClass.forEach((active) => e.target.classList.remove(active));
      activeClass.forEach((active) => e.target.classList.add(active));

      parent.querySelectorAll("[tab-content]").forEach((tabContent) => {
        tabContent.classList.add("hidden");
      });

      parent.querySelector(`[name="${target}"]`).classList.remove("hidden");
    });
  });

  // Copy to Clipboard
  document
    .querySelector("#copy")
    .addEventListener("button-click", (event, elm) => {
      const code = document.querySelector("[tab-content]:not(.hidden) pre");
      const content = code.innerText;
      navigator.clipboard.writeText(content).then(() => {
        message.Success({ title: "Copied to clipboard", duration: 2000 });
      });
    });

  // Download File
  document
    .querySelector("#download")
    .addEventListener("button-click", (event, elm) => {
      const id = document.querySelector(`[type="example"]`).dataset.id;
      const url = `/api/example/download/${id}`;
      window.location = url;
    });

  // preview
  document.querySelector("[preview]").addEventListener("load", (event, elm) => {
    const iframe = document.querySelector("[preview]");
    const spinner = document.querySelector("[spinner]");
    iframe.style.display = "block";
    spinner.classList.add("hidden");
  });
});

this.ToggleCode = (event, data, detail) => {
  const elm = detail.targetElement;
  const store = new __sui_store(elm);
  const example = elm.closest("[type='example']");
  const code = example.querySelector("[code]");
  const preview = example.querySelector("[preview-wrapper]");

  const active = store.Get("active") || "false";
  const activeClass = elm.getAttribute("active-class").split(" ");
  const defaultClass = elm.getAttribute("default-class").split(" ");
  if (active === "true") {
    store.Set("active", "false");
    activeClass.forEach((className) => elm.classList.remove(className));
    defaultClass.forEach((className) => elm.classList.add(className));
    code.classList.add("hidden");
    preview.classList.add("h-full");
    return;
  }

  store.Set("active", "true");
  defaultClass.forEach((className) => elm.classList.remove(className));
  activeClass.forEach((className) => elm.classList.add(className));
  code.classList.remove("hidden");
  preview.classList.remove("h-full");
};

this.ToggleTheme = (event, data, detail) => {
  const elm = detail.targetElement;
  const store = new __sui_store(elm);
  const theme = store.Get("theme") || "light";
  const icon = elm.querySelector("[icon]");
  const preview = document.querySelector("[preview]");
  const doc = preview.contentWindow.document;
  if (theme === "light") {
    store.Set("theme", "dark");
    icon.innerHTML = "light_mode";

    document.documentElement.setAttribute("class", "dark");
    doc.documentElement.setAttribute("class", "dark");
    preview.style.backgroundColor = "black";
    return;
  }

  store.Set("theme", "light");
  icon.innerHTML = "dark_mode";
  document.documentElement.removeAttribute("class");
  doc.documentElement.removeAttribute("class");
  preview.style.backgroundColor = "white";
};

this.ToggleDirection = (event, data, detail) => {
  const elm = detail.targetElement;
  const store = new __sui_store(elm);
  const direction = store.Get("direction") || "ltr";
  const icon = elm.querySelector("[icon]");
  const preview = document.querySelector("[preview]");
  const doc = preview.contentWindow.document;
  if (direction === "ltr") {
    store.Set("direction", "rtl");
    icon.innerHTML = "LTR";
    document.documentElement.setAttribute("dir", "rtl");
    doc.documentElement.setAttribute("dir", "rtl");
    return;
  }

  store.Set("direction", "ltr");
  icon.innerHTML = "RTL";
  document.documentElement.removeAttribute("dir");
  doc.documentElement.removeAttribute("dir");
};

this.ToggleDevice = (event, data, detail) => {
  const elm = detail.targetElement;
  const store = new __sui_store(elm);
  const device = store.Get("device") || "desktop";
  const icon = elm.querySelector("[icon]");
  const iframe = document.querySelector("[preview]");

  if (device === "desktop") {
    store.Set("device", "mobile");
    icon.innerHTML = "desktop_windows";
    iframe.style.width = "375px";
    return;
  }

  store.Set("device", "desktop");
  icon.innerHTML = "smartphone";
  iframe.style.width = "100%";
};
