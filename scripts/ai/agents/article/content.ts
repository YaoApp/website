import { neo, Process } from "@yao/runtime";
import { actions } from "../../actions";
import { ParseJSON } from "@scripts/ai/utils";

export const ContentInput: neo.IAgent = {
  Prepare: (ctx: neo.Context, messages: neo.Message[]): neo.Message[] => {
    const { formdata } = ctx;
    const categories = GetCategories();
    const prompts: neo.Message[] = [
      {
        role: "system",
        content: `${JSON.stringify({ categories })}`,
      },
      {
        role: "system",
        content: `${JSON.stringify({
          formdata: { content: formdata?.["content"] },
        })}`,
      },
      {
        role: "system",
        content: `
            - Based on the **formdata['content']** I provided, write an article according to my request.
            - IF formdata['content'] exists, refefence the article and write a new article.
            - Use the language should be formdata['language'], or I provided.
            - After writing the article, Extract the article’s title, slug, summary, category, X Share Message, SEO title, SEO keywords, and SEO description.
            - The categories must be one of the categories I provided. the maxcount of categories is 3.
            - The slug must be English and lowercase, can contain only letters, numbers, and hyphens, the max length is 50.
            - YOU MUST ANSWER ME WITH THE JSON FORMAT. SHOULD BE LIKE THIS: 
              { content: "article body", title: "article title", slug, summary: "article summary", categories: ["category1", "category2"], share_message: "share message", seo_title: "seo title", seo_keywords: "seo keywords", seo_description: "seo description" }
            - article body SHOULD BE MARKDOWN FORMAT STRING.
            - YOU MUST ANSWER ME THE JSON DATA WRAPPED IN A CODE BLOCK.
        `,
      },
    ];

    const lastMessage = messages[messages.length - 1];
    console.log("--- Prompts Content---");
    console.log([...prompts, lastMessage]);
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

    if (!response.done) {
      return [response];
    }

    // Set Fields Value and mark as done
    // Parse the content
    const data = ParseJSON(content);
    data["content"] =
      data["content"] || `Error: ${data["error"]}\n----\n${content}`;

    response.actions = [
      actions.Done(namespace, field),
      actions.SetFieldsValue(namespace, data),
      actions.setNeoVisible(true), // show chatbot, for editing the output.
    ];
    return [response];
  },
};

export function GetCategories(): string[] {
  const rows = Process("models.article.category.Get", { select: ["name"] });
  return rows.map((row) => row.name);
}
