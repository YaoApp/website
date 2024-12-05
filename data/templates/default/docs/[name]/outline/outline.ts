import { $Query, Component, EventDetail } from "@yao/sui";

// @ts-ignore
const root = $(arguments[0]);
const itemTemplate = root.find("[item-template]");
const divider = root.find("[divider]");

const activeClass = "text-primary dark:text-primary-400";
const defaultClass = "text-gray-500";

function escapeJQuerySelector(id) {
  return id.replace(/([ ;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
}

function Init() {
  const scrollTo = (elm) => {
    const offset = 96; // Adjust this value to offset the scroll position

    console.log(escapeJQuerySelector(elm));

    // @ts-ignore
    const target = $(escapeJQuerySelector(elm));
    if (target.length > 0) {
      const top = target.offset().top || false;
      if (top) {
        window.scrollTo({ top: top - offset, behavior: "smooth" });
        // Update the URL without refreshing the page
        if (history.pushState) {
          history.pushState(null, null, elm);
        } else {
          location.hash = elm;
        }
      }
    }
  };

  const active = (elm) => {
    root
      .find("[items]")
      .find("a")
      .each(function () {
        // @ts-ignore
        $(this).removeClass(activeClass).addClass(defaultClass);
      });
    if (elm) {
      // @ts-ignore
      const target = $(elm);
      target.removeClass(defaultClass).addClass(activeClass);
    }
  };

  // Scroll to top
  root.find("[scroll-to-top]").on("click", () => {
    // 50ms
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // when the document is scrolled
  // @ts-ignore
  $(root).on("document-scroll", (event, scrollTop) => {
    const offset = 128; // Adjust this value to offset the scroll position
    root
      .find("[items]")
      .find("a")
      .each(function () {
        // @ts-ignore
        const link = $(this).attr("href");
        // @ts-ignore
        const target = $(escapeJQuerySelector(link));
        const top = target.offset().top || false;
        if (top && scrollTop >= top - offset) {
          active(this);
          return;
        }
      });

    // scrollTop > 50 show scroll to top button
    if (scrollTop > 50) {
      root.find("[scroll-to-top]").removeClass("hidden");
    } else {
      root.find("[scroll-to-top]").addClass("hidden");
    }
  });

  // when the outline is updated
  // Render the outline items
  // after sui next version release, we can use setData instead
  // @ts-ignore
  $(root).on("change", (event, items) => {
    const list = root.find("[items]");
    list.html("");
    items.forEach((item) => {
      const element = itemTemplate.clone();
      element.find("a").attr("href", item.link);
      element.find("a").text(item.title);
      element.removeClass("hidden");
      element.on("click", (event) => {
        event.preventDefault();
        active(event.target);
        scrollTo(item.link);
      });
      list.append(element);
    });

    if (items.length > 0) {
      divider.removeClass("hidden");
    }
  });
}

Init();

const self = this as Component;
self.toggleOutline = function (event, data, detail: EventDetail) {
  const outline = self.store.Get("outline");
  if (outline == "false") {
    self.store.Set("outline", "true");
    const q = $Query(detail.rootElement);
    q.removeClass("w-8").addClass("w-56");
    q.find("[content]").removeClass("hidden");
    q.find("[title]").removeClass("hidden");
    q.find("[icon]").html("last_page");
    return;
  }

  self.store.Set("outline", "false");
  const q = $Query(detail.rootElement);
  q.removeClass("w-56").addClass("w-8");
  q.find("[content]").addClass("hidden");
  q.find("[title]").addClass("hidden");
  q.find("[icon]").html("first_page");
};
