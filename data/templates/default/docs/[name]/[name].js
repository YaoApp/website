import "@assets/js/remarkable.min.js";
import "@assets/js/highlight.min.js";

// Global Methods
window.Message = {
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

$(document).ready(function () {
  if (window.location.hash) {
    const offset = 96; // Adjust this value to offset the scroll position
    const target = $(escapeJQuerySelector(window.location.hash));
    if (target.length > 0) {
      const top = target.offset().top || false;
      if (top) {
        window.scrollTo({ top: top - offset, behavior: "smooth" });
      }
    }
  }
});

// Listen to the scroll event when the scroll to the section, active the outline item
$(document).on("scroll", () => {
  const scrollTop = $(window).scrollTop();
  $("#outline").trigger("document-scroll", [scrollTop]);
});

function escapeJQuerySelector(id) {
  return id.replace(/([ ;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
}
