import { actions } from "@scripts/ai/actions";
import { Name, PublicUploadRoot, Tempdir } from "@scripts/asset";
import { FS, io, log, neo, Process, time } from "@yao/runtime";

export const CoverInput: neo.IAgent = {
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
            - Based on the PREPARE CONTENT I provided, generate the dall-e-2 image prompt for the cover image of the article.
            - YOU MUST ANSWER ME THE COVER IMAGE PROMPT ONLY.
        `,
      },
    ];
    const lastMessage = messages[messages.length - 1];
    console.log("--- Prompts Cover---");
    console.log([...prompts, lastMessage]);
    return [...prompts, lastMessage];
  },

  Write: (
    ctx: neo.Context,
    messages: neo.Message[],
    response: neo.Response,
    content?: string,
    writer?: io.ResponseWriter
  ): neo.Response[] => {
    const { namespace, field } = ctx;
    if (content === undefined) {
      return [response];
    }

    // If the response is done, Request the dall-e-3 image and send the progress message.
    if (response.done) {
      const progressMessage: neo.Response = {
        text: "\r\nGenerating image, it may take a few minutes...",
        done: false,
      };

      Send(writer, [progressMessage]);
      const res = CreateImage(content, "1024x1024");
      const done: neo.Response = {
        done: true,
        actions: [actions.Done(namespace, field), actions.setNeoVisible(true)],
      };

      if (res.code && res.message && res.code != 200) {
        // Return error response
        const error: neo.Response = {
          text: `\r\nThere was an error generating image: \n${res.message}\n`,
        };
        return [error, done];
      }

      // Return success response and set the field value
      const success: neo.Response = {
        text: "\r\nThe cover image has been generated successfully!",
      };
      done.actions.push(
        actions.SetFieldsValue(namespace, { [field.bind]: [res.path] })
      );
      return [success, done];
    }

    const n = parseInt(((content?.length || 1) / 30).toFixed(0));
    const dots = ". ".repeat(n);
    response.text = `\r\n Prepare the cover image prompt for the article\n${dots}`;
    return [response];
  },
};

function CreateImage(prompt: string, width: E2Width = "1024x1024") {
  const model = "dall-e-2";
  const option = { size: width, n: 1, response_format: "b64_json" };
  try {
    const resp = Process("moapi.images.generations", model, prompt, option);
    const filename = `${Tempdir()}/${Name()}.png`;
    const target = `${PublicUploadRoot}/images/${filename}`;
    const base64 = resp.data?.["0"]?.["b64_json"] || undefined;
    if (!base64) {
      return { code: 500, message: "Response is empty" };
    }

    const fs = new FS("app");
    fs.WriteFileBase64(target, base64);
    return { path: `/images/${filename}` };
  } catch (error) {
    const message = error.message || error;
    return { code: 500, message: message };
  }
}

function Send(writer: io.ResponseWriter, response: neo.Response[]) {
  try {
    Process("neo.Write", writer, response);
  } catch (error) {
    console.log("Error in sending response", error);
  }
}

type E2Width = "1024x1024";
