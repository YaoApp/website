import { io, neo } from "@yao/runtime";
import { DefaultChat, DefaultInput } from "./agents/defaults";
import { SelectAgent } from "./agents/select";

/**
 * Neo Prepare hook
 */
function Prepare(ctx: neo.Context, messages: neo.Message[]): neo.Message[] {
  const { namespace, field } = ctx;

  const agent = SelectAgent(ctx);
  if (agent) {
    return agent.Prepare(ctx, messages);
  }

  // AI Powered Input
  if (namespace && field && field.bind) {
    return DefaultInput.Prepare(ctx, messages);
  }

  // AI Chatbot
  return DefaultChat.Prepare(ctx, messages);
}

/**
 * Neo Write hook
 */
function Write(
  ctx: neo.Context,
  messages: neo.Message[],
  response: neo.Response,
  content?: string,
  writer?: io.Writer
): neo.Response[] {
  const { namespace, field } = ctx;
  const agent = SelectAgent(ctx);
  if (agent) {
    return agent.Write(ctx, messages, response, content, writer);
  }

  // AI Powered Input
  if (namespace && field && field.bind) {
    return DefaultInput.Write(ctx, messages, response, content, writer);
  }

  // AI Chatbot
  return DefaultChat.Write(ctx, messages, response, content);
}
