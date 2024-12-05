import { neo } from "@yao/runtime";
import { ContentInput } from "./article/content";
import { ShareMessageInput } from "./article/share_message";
import { CoverInput } from "./article/cover";
import { PlaygroundInput } from "./playground";

/**
 * Select the agent based on the context
 */
export function SelectAgent(ctx: neo.Context): neo.IAgent | null {
  const { namespace, field } = ctx;
  switch (namespace) {
    // Blog form page
    case "Form-Page-article":
      return articleAgent(field);

    // Playground form page
    case "Form-Page-playground":
      return PlaygroundInput;
  }
  return null;
}

/**
 * Agent for article namespace, based on the field
 * @param field
 * @returns
 */
function articleAgent(field: neo.Field): neo.IAgent | null {
  if (!field || !field.bind) return null;
  switch (field.bind) {
    case "content":
      return ContentInput;

    case "cover":
      return CoverInput;

    case "share_message":
      return ShareMessageInput;
  }
  return null;
}
