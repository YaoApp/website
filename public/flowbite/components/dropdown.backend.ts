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
  data.items = props.items === undefined ? null : props.items;

  // selected
  const selected = [];
  if (props.selected && props.selected != "") {
    if (typeof props.selected === "string") {
      props.selected.split(",").forEach((item) => selected.push(item));
    }
    if (Array.isArray(props.selected)) {
      props.selected.forEach((item) => selected.push(item));
    }
  }
  data.selected = selected.join(",");
  data.items?.forEach(
    (item) => selected.includes(item.value) && (item.selected = true)
  );

  // Fix opened data
  data.opened =
    props.opened != undefined && props.opened == "true" ? true : false;

  // calculate sizes
  data.size = props.size || Constants.defaults.size; // Set the size
  data.sizeClass = Constants.sizes[data.size] || Constants.sizes.base;
  data.itemSizeClass = Constants.itemSize[data.size] || Constants.itemSize.base;

  // calculate colors
  data.color = props.color || Constants.defaults.color; // Set the color
  data.colorClass = Constants.colors[data.color] || Constants.colors.primary;
  data.itemColorClass =
    Constants.itemColors[props.itemColor] || Constants.itemColors.primary;

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
    loading: false,
    disabled: false,
    opened: false,
    api: null,
    error: false,
    color: "primary",
    mode: "single",
  },

  sizes: {
    xs: "text-xs px-2 py-1 min-h-8",
    sm: "text-sm px-2.5 py-1.5 min-h-10",
    base: "text-sm px-3 py-2 min-h-12",
    lg: "text-base px-4 py-2.5 min-h-14",
    xl: "text-lg px-5 py-3 min-h-16",
  },

  itemSize: {
    xs: "text-xs px-3 py-1.5",
    sm: "text-sm px-3 py-1.5",
    base: "text-sm px-3 py-2",
    lg: "text-base px-5 py-2.5",
    xl: "text-lg px-6 py-3",
    none: "",
  },

  // wrapperColors
  colors: {
    primary: `bg-white dark:bg-black text-gray-900 dark:text-gray-100`,
    dark: `bg-white dark:bg-gray-800 text-gray-100 dark:text-gray-900`,
    light: `bg-gray-800 dark:bg-white text-gray-900 dark:text-gray-100`,
    danger: `bg-danger-50 dark:bg-dark-danger-50 text-danger dark:text-dark-danger`,
    success: `bg-success-50 dark:bg-dark-success-50 text-success dark:text-dark-success`,
    warning: `bg-warning-50 dark:bg-dark-warning-50 text-warning dark:text-dark-warning`,
    info: `bg-info-50 dark:bg-dark-info-50 text-info dark:text-dark-info`,
    none: ``,
  },

  itemColors: {
    primary: `
      text-gray-900 dark:text-gray-100
      hover:bg-primary-50 dark:hover:bg-dark-primary-500
    `,
    dark: `text-gray-100 dark:text-gray-900`,
    light: `text-gray-900 dark:text-gray-100`,
    danger: `text-danger dark:text-dark-danger`,
    success: `text-success dark:text-dark-success`,
    warning: `text-warning dark:text-dark-warning`,
    info: `text-info`,
    none: ``,
  },
};


this.__sui_page = '/flowbite/components/dropdown';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
