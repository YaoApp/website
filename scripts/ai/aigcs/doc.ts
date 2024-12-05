import { FS, Process } from "@yao/runtime";

/**
 * Generates documentation for the component.
 * yao run scripts.ai.aigcs.doc.Component /flowbite/components/edit/input
 */
function Component(route: string) {
  const prompts = `
    - The source code is a sui component.
    - self.watch or this.watch is defined the "state" of the component.
    - you need to anylize the template and the script to auto-generate "props" and "events" for the component.
    - The "## Props" section should be generated from the "BeforeRender" function.
    - The "## State" section should be generated from the "watch" function. 
    - The "## Events" section should be generated from the "s:on" tags in the source.
    - **If the "props" name same as the "state" name, then put the end of the "props" section.**
    - **If the "props" name is camelCase, then convert it to kebab-case.**
    - **You must follow the example format.**
    - Please read the source code and help me to generate the documents.
    - I will pay you 5$ for this task.
    - The documents should be following provided the example.
  `;

  const root = `/templates/default${route}`;
  const fs = new FS("data");
  const name = fs.BaseName(route);
  const script = `${root}/${name}.ts`;
  const backend = `${root}/${name}.backend.ts`;
  const html = `${root}/${name}.html`;
  const messages: Message[] = [];

  if (fs.Exists(script)) {
    const content = fs.ReadFile(script);
    messages.push({
      role: "system",
      content: `This is the frontend script for the ${name} component\n${content}`,
    });
  }

  if (fs.Exists(backend)) {
    const content = fs.ReadFile(backend);
    messages.push({
      role: "system",
      content: `This is the backend script for the ${name} component\n${content}`,
    });
  }

  if (fs.Exists(html)) {
    const content = fs.ReadFile(html);
    messages.push({
      role: "system",
      content: `This is the HTML template for the ${name} component\n${content}`,
    });
  }

  const example = `/docs/component.tpl.md`;
  const content = fs.ReadFile(example);
  messages.push({
    role: "system",
    content: `This is the example of the documentation for the ${name} component\n${content}`,
  });

  messages.push({ role: "user", content: prompts });
  Chat(messages);
}

/**
 * yao run scripts.ai.aigcs.doc.test
 */
function test() {
  Chat([{ role: "user", content: "Hello" }]);
}

function Chat(message: Message[]) {
  let response = "";
  Print(`\n##\n\n`);
  Process(
    "openai.chat.Completions",
    "moapi:gpt-4o",
    message,
    null,
    (data: string) => {
      if (data == "data: [DONE]") {
        Print(`\n\n##\n\n`);
        Print(response, "HiGreen");
        Print(`\n\n##\n\n`);
        return 0;
      }

      if (data.startsWith("data: ")) {
        const raw = data.replace("data: ", "");
        try {
          const json = JSON.parse(raw);
          const content = json.choices[0]?.delta?.content;
          if (content) {
            response += content;
          }

          Print(`\r${response.length / 1000}k`);
        } catch (error) {
          console.log(raw);
        }
      }

      return 1;
    }
  );
}

function Print(content: string, color: string = "HiWhite") {
  Process("utils.fmt.ColorPrintf", color, content);
}

type Message = {
  role: string;
  content: string;
};
