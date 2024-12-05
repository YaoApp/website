import { neo } from "@yao/runtime";
import { actions } from "../actions";

export const DefaultChat: neo.IAgent = {
  Prepare: (ctx: neo.Context, messages: neo.Message[]): neo.Message[] =>
    messages,
  Write: (
    ctx: neo.Context,
    messages: neo.Message[],
    response: neo.Response,
    content?: string
  ): neo.Response[] => [response],
};

export const DefaultInput: neo.IAgent = {
  Prepare: (ctx: neo.Context, messages: neo.Message[]): neo.Message[] =>
    messages,
  Write: (
    ctx: neo.Context,
    messages: neo.Message[],
    response: neo.Response,
    content?: string
  ): neo.Response[] => {
    const { namespace, field } = ctx;
    if (content === undefined) {
      return [response];
    }

    // Set Fields Value and mark as done
    if (response.done) {
      response.actions = [
        actions.Done(namespace, field),
        actions.SetFieldsValue(namespace, { [field.bind]: content }),
        actions.setNeoVisible(true), // show chatbot, for editing the output.
      ];
      return [response];
    }

    return [response];
  },
};
