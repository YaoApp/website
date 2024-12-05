import { FS, neo } from "@yao/runtime";
import { actions } from "../actions";
import { GetDSLByPage } from "@scripts/playground";

export const PlaygroundInput: neo.IAgent = {
  Prepare: (ctx: neo.Context, messages: neo.Message[]): neo.Message[] => {
    const { formdata } = ctx;
    const { url, dsl: input_source } = formdata || { url: "", dsl: "" };
    let dsl: Record<string, any> = {};
    const lastMessage = messages[messages.length - 1];

    try {
      dsl = GetDSLByPage(url, false);
    } catch (e) {
      return messages;
    }

    const samples = getSamples(dsl.type);
    const bindTable = [];
    if (dsl.type === "Form" && dsl.id) {
      const fs = new FS("app");
      const bindTablePath = `/tables/${dsl.id.replace(".", "/")}.tab.yao`;
      console.log("bindTablePath", bindTablePath);
      if (fs.Exists(bindTablePath)) {
        bindTable.push({
          role: "system",
          content: `${JSON.stringify({
            "FORM BIND TABLE DSL:": fs.ReadFile(bindTablePath),
          })}`,
        });
      }
    }

    const prompts: neo.Message[] = [
      {
        role: "system",
        content: `${JSON.stringify({ "SAMPLE DSLs:": samples })}`,
      },
      {
        role: "system",
        content: `${JSON.stringify({ "CURRENT DSL SOURCE:": input_source })}`,
      },
      ...bindTable,
      {
        role: "system",
        content: `
            - I have provided the CURRENT DSL SOURCE, FORM BIND TABLE DSL, and more SAMPLE DSLs.
            - I maybe provide you a new model, and some demands.
            - You need to write a new DSL like the current one, replace the model and fields based on the new model or demands.
            - DO NOT ADD THE FIELD NOT IN THE MODEL OR DEMANDS.
            - YOU MUST ANSWER ME THE DSL AND WRAPPED IN A CODE BLOCK.
        `,
      },
    ];

    return [...prompts, lastMessage];
  },

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
      //if has ```json ...``` or ```jsonc ... ````, get the content inside
      const re = /```jsonc?([\s\S]+)```/g;
      const matches = content.match(re);
      if (matches) {
        content = matches[0].replace(/```jsonc?/g, "").replace(/```/g, "");
        response.actions = [
          actions.Done(namespace, field),
          actions.SetFieldsValue(namespace, { dsl: content }),
        ];
        return [response];
      }
    }
    return [response];
  },
};

function getSamples(type?: string): string[] {
  const fs = new FS("app");
  switch (type) {
    case "Table":
      return [
        fs.ReadFile("/tables/article.tab.yao"),
        fs.ReadFile("/tables/article/category.tab.yao"),
      ];
    case "Form":
      return [
        fs.ReadFile("/forms/article.form.yao"),
        fs.ReadFile("/forms/article/category.form.yao"),
      ];
  }
  return [];
}
