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

  // Fix the error and success data
  data.error =
    props.error != undefined && props.error != "false" ? true : false;
  data.success =
    props.success != undefined && props.error != "false" ? true : false;
  data.disabled =
    props.disabled != undefined && props.disabled != "false" ? true : false;

  // Calculate sizes
  data.size = props.size || Constants.defaults.size; // Set the size
  data.iconSize = Constants.iconSizes[data.size];
  data.inputSize = Constants.inputSizes[data.size];
  data.buttonSize = data.size == "lg" ? "sm" : "xs";

  data.iconPosition = Constants.iconPositions[data.size] || "me-1";
  data.buttonPosition = Constants.buttonPositions[data.size] || "end-1.5";
  data.inputPosition =
    data.icon && data.icon != ""
      ? Constants.inputPositions.withIcon[data.size]
      : Constants.inputPositions[data.size];

  // Calculate colors
  data.color = data.color || "primary"; // Set the color
  if (data.disabled) data.color = "disabled";
  if (data.error) data.color = "danger";
  if (data.success) data.color = "success";

  data.iconColor = Constants.iconColors[data.color];
  data.inputColor = Constants.inputColors[data.color];

  // Custom properties
  data.buttonClass = props.buttonClass || "px-4 py-2";
  data.inputClass = props.inputClass || "";

  return {
    ...data,
    iconSizes: Constants.iconSizes,
  };
}

/**
 * The component constants
 * this object will be shared between the backend and frontend scripts
 * you can't use any backend code or functions here, only static data
 */
const Constants = {
  defaults: {
    buttonColor: "primary",
    size: "base",
    type: "text",
    button: false,
    disabled: false,
    error: false,
    success: false,
    required: false,
  },

  iconSizes: {
    sm: "text-base ps-1.5 ps-2.5",
    base: "text-base py-2 ps-2.5",
    lg: "text-xl py-2.5 ps-4",
    none: "",
  },

  inputSizes: {
    sm: "text-sm py-1.5",
    base: "text-sm py-2.5",
    lg: "text-base py-4",
    none: "",
  },

  iconPositions: {
    sm: "me-0.5 rtl:ms-0.5 rtl:me-0",
    base: "me-1 rtl:ms-1 rtl:me-0",
    lg: "me-1 rtl:ms-1 rtl:me-0",
    none: "",
  },

  inputPositions: {
    sm: "ps-2.5",
    base: "ps-3",
    lg: "ps-4",
    withIcon: {
      sm: "ps-8",
      base: "ps-8",
      lg: "ps-10",
      none: "",
    },
    none: "",
  },

  buttonPositions: {
    sm: "end-0",
    base: "end-1.5",
    lg: "end-2.5",
    none: "",
  },

  inputColors: {
    primary: `
      rounded-lg border
      text-gray-900 dark:text-gray-200
      border-gray-100 dark:border-gray-700
      bg-gray-50 dark:bg-gray-800 
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      focus:ring-primary dark:focus:ring-dark-primary-400
      focus:border-primary dark:focus:border-dark-primary-400
    `,

    success: `
      rounded-lg border
      text-success-900 dark:text-dark-success-200
      border-success-100 dark:border-dark-success-700
      bg-success-50 dark:bg-dark-success-800 
      placeholder:text-success-400 dark:placeholder:text-dark-success-500
      focus:ring-success dark:focus:ring-dark-success-400
      focus:border-success dark:focus:border-dark-success-400
    `,

    danger: `
      rounded-lg border
      text-danger-900 dark:text-dark-danger-200
      border-danger-100 dark:border-dark-danger-700
      bg-danger-50 dark:bg-dark-danger-800 
      placeholder:text-danger-400 dark:placeholder:text-dark-danger-500
      focus:ring-danger dark:focus:ring-dark-danger-400
      focus:border-danger dark:focus:border-dark-danger-400
    `,

    disabled: `
      rounded-lg border
      text-gray-400 dark:text-gray-400
      border-gray-100 dark:border-gray-800
      bg-gray-100 dark:bg-gray-800 
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      focus:ring-gray dark:focus:ring-gray-400
      focus:border-gray dark:focus:border-gray-400
    `,

    none: "",
  },

  iconColors: {
    primary: "text-gray-400 dark:text-gray-500",
    success: "text-success dark:text-success",
    danger: "text-danger dark:text-danger",
    disabled: "text-gray-400 dark:text-gray-500",
    none: "",
  },
};
