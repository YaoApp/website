/**
 * This is the backend script for the FormItem component
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
  data.labelSize = Constants.labelSizes[data.size];
  data.helperSize = Constants.helperSizes[data.size];

  // Calculate colors
  data.color = data.color || "primary"; // Set the color
  if (data.disabled) data.color = "disabled";
  if (data.error) data.color = "danger";
  if (data.success) data.color = "success";
  data.labelColor = Constants.labelColors[data.color];
  data.helperColor = Constants.helperColors[data.color];

  // Calculate label properties
  data.labelFor = props.labelFor || data.id;
  data.labelPosition = props.labelPosition || Constants.defaults.labelPosition;
  data.labelAlign = props.labelAlign || Constants.defaults.labelAlign;
  data.labelWidth = props.labelWidth || null;
  data.labelWidthClass =
    props.labelWidth || Constants.labelWidths[data.labelPosition];
  data.labelPositionClass = Constants.labelPositions[data.labelPosition];
  data.labelAlignClass = Constants.labelAligns[data.labelAlign];

  return data;
}

/**
 * The component constants
 * this object will be shared between the backend and frontend scripts
 * you can't use any backend code or functions here, only static data
 */
const Constants = {
  defaults: {
    size: "base",
    labelPosition: "top",
    labelAlign: "left",
    disabled: false,
    error: false,
    success: false,
  },

  labelWidths: {
    left: "w-1/4",
    right: "w-1/4",
    top: "w-full",
    none: "",
  },

  labelSizes: {
    sm: "text-sm py-1.5 mt-0.5",
    base: "text-sm py-2 mt-1",
    lg: "text-base py-2.5 mt-1.5",
    none: "",
  },

  labelPositions: {
    top: "flex flex-col",
    left: "flex flex-row items-start",
    right: "flex flex-row-reverse items-start",
    none: "",
  },

  labelAligns: {
    left: "text-left rtl:text-right",
    center: "text-center",
    right: "text-right rtl:text-left",
    none: "",
  },

  labelColors: {
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

  helperSizes: {
    sm: "text-sm py-1.5",
    base: "text-sm py-2",
    lg: "text-base py-2.5",
    none: "",
  },

  helperColors: {
    primary: "text-gray-500 dark:text-gray-500",
    success: "text-success  dark:text-success ",
    danger: "text-danger  dark:text-danger",
    disabled: "text-gray-400 dark:text-gray-500",
    focus: "text-gray-900 dark:text-gray-200",
    none: "",
  },
};


this.__sui_page = '/flowbite/components/form/item';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
