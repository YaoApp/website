const root = arguments[0];
const button = root.querySelector("button");
function Init() {
  button.addEventListener("click", (e) => {
    const ButtonClickEvent = new CustomEvent("button-click", {
      detail: { button: button },
    });
    root.dispatchEvent(ButtonClickEvent);
  });
}
Init();
