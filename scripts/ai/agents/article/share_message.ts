import { neo } from "@yao/runtime";
import { DefaultInput } from "../defaults";

export const ShareMessageInput: neo.IAgent = {
  Prepare: (ctx: neo.Context, messages: neo.Message[]): neo.Message[] => {
    const { formdata } = ctx;
    const { content } = formdata || {};
    const prompts: neo.Message[] = [
      {
        role: "system",
        content: `${JSON.stringify({ "PREPARE CONTENT:": content || "" })}`,
      },
      {
        role: "system",
        content: `
            - Based on the PREPARE CONTENT I provided, write an SHARE MESSAGE according to my request.
            - Use the language should be same as the content, or I provided.
            - YOU MUST ANSWER ME THE SHARE MESSAGE ONLY. 
            - DO NOT WRITE ANYTHING ELSE.
        `,
      },
    ];

    const lastMessage = messages[messages.length - 1];
    console.log("--- Prompts Share Message---");
    console.log([...prompts, lastMessage]);
    return [...prompts, lastMessage];
  },

  Write: DefaultInput.Write,
};
