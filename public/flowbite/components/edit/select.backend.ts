/**
 * This is the backend script for the Input component
 */
import { sui } from "@yao/runtime";

/**
 * Component render hook
 * It will be called before rendering the component
 * It is used to define the component props and data
 * @param request The sui page request object
 * @param props The component props
 * @returns The component data
 */
function BeforeRender(
  request: sui.Request,
  props: Record<string, string>
): Record<string, any> {
  const data: Record<string, any> = { ...Constants.defaults, ...props }; // Copy the props
  data.id = `${props.id || new Date().getTime()}`; // Generate a unique id

  // Value
  data.mode = props.mode || Constants.defaults.mode; // Set the mode
  parseValues(data, props); // Parse the values for multiple mode

  data.value = props.value || null; // Set the value
  data.label = data.value == null ? null : props.label || null; // Set the label
  if (data.value != null && props.options && typeof props.options != "string") {
    const options: Record<string, any>[] = props.options || [];
    const option = options.find((item) => item.value == data.value);
    if (option) data.label = option.label;
  }

  // Fix the error and success data
  data.error =
    props.error != undefined && props.error != "false" ? true : false;
  data.success =
    props.success != undefined && props.error != "false" ? true : false;
  data.disabled =
    props.disabled != undefined && props.disabled != "false" ? true : false;

  // Calculate sizes
  data.size = props.size || Constants.defaults.size; // Set the size
  data.tagSize = Constants.tagSizes[data.size] || Constants.tagSizes.base;
  data.tagPosition =
    Constants.tagPositions[data.size] || Constants.tagPositions.base;
  data.tagColor =
    Constants.tagColors[data.color] || Constants.tagColors.primary;
  data.actionIconSize = Constants.actionIconSizes[data.size] || "text-sm";
  data.actionIconPosition =
    Constants.actionIconPositions[data.size] || "end-1.5";

  // Calculate colors
  data.color = data.color || "primary"; // Set the color
  if (data.disabled) data.color = "disabled";
  if (data.error) data.color = "danger";
  if (data.success) data.color = "success";
  data.tagColor =
    Constants.tagColors[data.color] || Constants.tagColors.primary;
  data.actionIconColor = Constants.actionIconColors[data.color];

  return { ...data };
}

function parseValues(data: Record<string, any>, props: Record<string, any>) {
  if (data.mode == "multiple") {
    data.value = null;
    data.values = [];
    if (typeof props.value == "string") {
      const values = props.value ? props.value.split(",") : [];
      values.forEach((value) => {
        data.values.push({ value: value, label: value });
      });
    } else if (Array.isArray(props.value)) {
      const values: any[] = props.value || [];
      values.forEach((value) => {
        if (typeof value == "string") {
          data.values.push({ value: value, label: value });
        } else if (typeof value == "object") {
          data.values.push({ value: value.value, label: value.label });
        }
      });
    }

    data.selected = data.values.map((item) => item.value).join(",");
    props.value = data.selected;
  }
}

/**
 * The component constants
 * this object will be shared between the backend and frontend scripts
 * you can't use any backend code or functions here, only static data
 */
const Constants = {
  defaults: {
    size: "base",
    type: "text",
    disabled: false,
    error: false,
    success: false,
    mode: "single",
    api: null,
    options: [],
  },

  tagSizes: {
    sm: "mb-1 me-1 py-1 px-2 text-xs",
    base: "mb-1.5 me-1.5 py-1.5 px-2.5 text-xs",
    lg: "mb-2 me-2 py-2 px-3 text-sm",
    none: "",
  },

  tagPositions: {
    sm: { default: "inset-x-2.5 py-[5px]", withIcon: "inset-x-8 py-[5px]" },
    base: { default: "inset-x-3.5 py-[7px]", withIcon: "inset-x-8 py-[7px]" },
    lg: { default: "inset-x-4 py-[11px]", withIcon: "inset-x-10 py-[11px]" },
    none: "",
  },

  tagColors: {
    primary: `
      text-gray-800 dark:text-gray-200 
      bg-gray-200 dark:bg-gray-900 
      hover:bg-gray-100 dark:hover:bg-gray-700
    `,

    success: `
      text-success-700 dark:text-dark-success-200 
      bg-success-200 dark:bg-dark-success-900 
      hover:bg-success-100 dark:hover:bg-dark-success-700
    `,

    danger: `
      text-danger-700 dark:text-dark-danger-200 
      bg-danger-200 dark:bg-dark-danger-900 
      hover:bg-danger-100 dark:hover:bg-dark-danger-700
    `,

    disabled: `
      text-gray-400 dark:text-gray-500 
      bg-gray-200 dark:bg-gray-700
      cursor-default
    `,
    none: "",
  },

  actionTypes: {
    open: { icon: "arrow_drop_down", class: "" },
    close: { icon: "close", class: "" },
    search: { icon: "search", class: "" },
    clear: { icon: "clear", class: "" },
    loading: { icon: "loading", class: "animate-spin" },
  },

  actionIconPositions: {
    sm: "end-2",
    base: "end-2.5",
    lg: "end-3.5",
    none: "",
  },

  actionIconSizes: {
    sm: "text-base",
    base: "text-base",
    lg: "text-xl",
    none: "",
  },

  actionIconColors: {
    primary: `
      text-gray-600  dark:text-gray-500
      hover:text-gray-900 dark:hover:text-gray-200 
    `,
    success: `
      text-success-600  dark:text-dark-success-500
      hover:text-success-900 dark:hover:text-dark-success-200 
    `,
    danger: `
      text-danger-600  dark:text-dark-danger-500
      hover:text-danger-900 dark:hover:text-dark-danger-200 
    `,
    disabled: `
      text-gray-400 dark:text-gray-500
    `,
    focus: `
      text-gray-900 dark:text-gray-200 
    `,
    none: "",
  },
};


this.__sui_page = '/flowbite/components/edit/select';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
