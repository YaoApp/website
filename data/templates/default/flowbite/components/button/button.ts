const colorStyles = {
  primary:
    "text-white bg-primary-700 hover:bg-primary-800 dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700",
  dark: "text-gray-100 bg-gray-900  hover:bg-gray-700 dark:text-gray-900 dark:bg-gray-100 dark:hover:bg-gray-200",
  light:
    "text-gray-900 bg-white box-border border border-gray-200 hover:bg-gray-100 dark:text-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-700",
  danger:
    "text-white bg-danger-700 hover:bg-danger-800 dark:bg-dark-danger-600 dark:hover:bg-dark-danger-700",
  success:
    "text-white bg-success-700 hover:bg-success-800 dark:bg-dark-success-600 dark:hover:bg-dark-success-700",
  warning:
    "text-white bg-warning-700 hover:bg-warning-800 dark:bg-dark-warning-600 dark:hover:bg-dark-warning-700",
  info: "text-white bg-info-700 hover:bg-info-800 dark:bg-dark-info-600 dark:hover:bg-dark-info-700",
  none: "",
};

const disabledStyles = {
  primary: "text-white bg-primary-300 dark:bg-dark-primary-300",
  dark: "text-gray-300 bg-gray-700 dark:bg-gray-700",
  light:
    "text-gray-300 bg-white box-border border border-gray-200 dark:text-gray-700 dark:border-gray-800 dark:bg-gray-900",
  danger: "text-white bg-danger-300 dark:bg-dark-danger-300",
  success: "text-white bg-success-300 dark:bg-dark-success-300",
  warning: "text-white bg-warning-300 dark:bg-dark-warning-300",
  info: "text-white bg-info-300 dark:bg-dark-info-300",
  none: "",
};

function removeClass(element: HTMLElement, classNames: string) {
  classNames.split(" ").forEach((className) => {
    className &&
      element.classList.contains(className) &&
      element.classList.remove(className);
  });
}

function addClass(element: HTMLElement, classNames: string) {
  classNames.split(" ").forEach((className) => {
    className &&
      !element.classList.contains(className) &&
      element.classList.add(className);
  });
}

this.watch = {
  disabled: (value) => {
    const button = this.root.querySelector("[button]") as HTMLDivElement;
    const color = button.getAttribute("color") || "primary";
    if (value) {
      removeClass(button, colorStyles[color]);
      addClass(button, disabledStyles[color]);
      button.setAttribute("disabled", "true");
      return;
    }
    removeClass(button, disabledStyles[color]);
    addClass(button, colorStyles[color]);
    button.removeAttribute("disabled");
  },

  loading: (value) => {
    const icon = this.root.querySelector("[icon]") as HTMLDivElement;
    const button = this.root.querySelector("[button]") as HTMLDivElement;
    if (value) {
      icon.classList.add("animate-spin");
      icon.innerHTML = `progress_activity`;
      button.setAttribute("disabled", "true");
      return;
    }

    const name = icon.getAttribute("name");
    icon.classList.remove("animate-spin");
    icon.innerHTML = name;
    button.removeAttribute("disabled");
  },
};
