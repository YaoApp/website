const elm = $(arguments[0]);

function Init() {
  // Force Expand the active submenu
  elm
    .find("[submenu] > ul")
    .find("li")
    .each(function () {
      if ($(this).hasClass("active")) {
        elm.find("[submenu] > ul").removeClass("hidden");
        elm.find("[submenu] [toggle]").html("keyboard_arrow_down");
      }
    });

  // Toggle Submenu
  elm.find("[submenu] [toggle]").on("click", function (event) {
    event.preventDefault();
    console.log($(this));
    $(this)
      .closest("[submenu]")
      .find("ul")
      .slideToggle(100)
      .toggleClass("hidden");

    $(this).html(
      $(this).closest("[submenu]").find("ul").hasClass("hidden")
        ? "keyboard_arrow_right"
        : "keyboard_arrow_down"
    );
  });

  // Scroll to active item when sidebar is loaded
  setTimeout(() => {
    const active = elm.find("[menu-item].active");
    if (active.length) {
      const activeTop = active.position().top;
      const activeHeight = active.outerHeight();
      const sidebarHeight = elm.height();
      const scrollTop = elm.scrollTop();

      // Smooth scroll to the active item
      if (activeTop + activeHeight > sidebarHeight) {
        elm.animate({ scrollTop: scrollTop + activeTop }, 100);
      }
    }
  }, 10);
}

Init();
