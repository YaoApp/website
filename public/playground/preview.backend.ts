import { SuiRequest } from "@yao/runtime";
import { $$, EventData, Component, EventDetail, $Query } from "@yao/sui";

/**
 * Component render hook
 * It will be called before rendering the component
 * It is used to define the component props and data
 * @param request The sui page request object
 * @param props The component props
 * @returns The component data
 */
function BeforeRender(
  request: SuiRequest,
  props: Record<string, string>
): Record<string, any> {
  const query = request.query;
  const data: Record<string, any> = { ...props }; // Copy the props

  console.log("BeforeRender", data);

  return data;
}


this.__sui_page = '/playground/preview';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
