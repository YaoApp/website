const root = $(arguments[0]);

function Init() {
  const root_id = root.attr("id") || null;

  root.on("show", (event, message) => {
    message = message || event.detail || {};
    const clone = root.clone();
    const alert = clone.find(`[role="alert"]`);
    const close = clone.find(`[close]`);
    const id = `${root_id}-toast-${Date.now()}`;
    const duration = message.duration || root.data("duration") || null;
    clone.attr("id", id);
    setPosition(alert);
    setTheme(alert, message.type || "primary");
    setMessage(alert, message);

    clone.on("hide", (event) => {
      try {
        alert.removeClass("opacity-100").addClass("opacity-0");
        clone.one("transitionend", (e) => {
          clone.addClass("hidden");
          clone.remove();
        });
      } catch (e) {}
    });

    close.on("click", (e) => clone.trigger("hide"));
    clone.removeClass("hidden");
    document.body.append(clone[0]);
    setTimeout(() => alert.removeClass("opacity-0").addClass("opacity-100"), 5);
    if (duration !== null) {
      setTimeout(() => clone.trigger("hide"), parseInt(duration));
    }
  });
}

function setMessage(alert, message) {
  message = message || {};
  if (message.message && message.message.length > 0) {
    alert.find("[message]").html(message.message).removeClass("hidden");
  }

  if (message.title && message.title.length > 0) {
    alert.find("[title]").html(message.title).removeClass("hidden");
  }

  if (message.icon && message.icon.length > 0) {
    alert.find("[icon]").html(message.icon);
  }
}

function setTheme(alert, type) {
  const colors = {
    primary: "primary",
    info: "primary",
    success: "success",
    warning: "warning",
    error: "danger",
  };

  const icons = {
    primary: "exclamation",
    info: "exclamation",
    success: "check",
    warning: "exclamation",
    error: "exclamation",
  };

  const color = colors[type] || "primary";

  alert.find("[icon]").html(icons[type] || "info");
  alert
    .find("[icon-bg]")
    .removeClass("bg-primary")
    .addClass(`bg-${color}`)
    .removeClass("hidden");
}

function setPosition(alert) {
  const position = root.data("position") || "bottom-right";
  const positions = {
    "top-right": "top-5 right-5",
    "top-left": "top-5 left-5",
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-4",
  };
  alert.addClass(positions[position] || "bottom-5 right-5");
}

Init();
