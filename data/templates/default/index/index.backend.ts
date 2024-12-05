import { http, log, Store, sui } from "@yao/runtime";

function Examples(r: sui.Request) {
  return [
    {
      name: "Model",
      code: model(),
      lang: "json",
      active: true,
      icon: "database",
    },
    { name: "API", code: api(), lang: "json", icon: "api" },
    { name: "Website", code: website(), lang: "html", icon: "public" },
    { name: "Dashboard", code: dashboard(), lang: "json", icon: "dashboard" },
    { name: "CLI", code: cli(), lang: "typescript", icon: "terminal" },
  ];
}

function Features(r: sui.Request) {
  return [
    {
      name: "AI First",
      icon: "psychology",
      description: `
         We have designed a human-machine-friendly DSL that makes both AI-generated and manually written code more efficient, enabling easy transitions between the two.
      `,
    },
    {
      name: "All-in-one",
      icon: "communities",
      description: `
       Yao is an all-in-one solution for app development, 
       this greatly reduces the complexity of interacting with AI, significantly improving both the efficiency and quality of the generated code.
      `,
    },
    {
      name: "Native TypeScript Support",
      icon: "frame_source",
      description: `
        Yao includes a built-in V8 engine with TypeScript support, allowing direct code execution and 
        offers comprehensive programming capabilities.
      `,
    },
    {
      name: "Multiple Coding Approaches",
      icon: "stack_star",
      description: `
        Combine AI-generated code, visual editing, and manual coding in the same project, 
        with generated code that is easy to read and modify manually.
      `,
    },
    {
      name: "Serverless",
      icon: "dns",
      description: `
      Launch in seconds with built-in cloud functions and API gateways to easily create server-side apps.
      Integrate easily with the DevOps ecosystem for one-click deployment.
      `,
    },
    {
      name: "Edge Devices Support",
      icon: "developer_board",
      description: `
      Yao apps also support running on edge devices equipped with ARM64 or x86 chips, 
      suitable for various scenarios in IoT applications.
      `,
    },
  ];
}

function Github(r: sui.Request) {
  const ts = new Date().getTime();
  const cache = new Store("cache");
  const key = "github-stat";
  const data = cache.Get(key);
  if (data) {
    const { stars, ts: lastTs } = data;
    if (ts - lastTs < 3600 * 24 * 1000) {
      return { stars, ts };
    }
  }

  // Get data via Github API
  const url = "https://api.github.com/repos/yaoapp/yao";
  const res = http.Get(url, {}, { Accept: "application/vnd.github.v3+json" });
  if (res.status !== 200) {
    log.Error(
      "Failed to get data from Github API. %v %v",
      res.code,
      res.message
    );
    return { stars: 7.2, ts };
  }

  const stars = (res.data.stargazers_count / 1000).toFixed(1);
  cache.Set(key, { stars, ts });
  return { stars, ts };
}

function model() {
  return JSON.stringify({ model: "1" }, null, 2);
}

function api() {
  return JSON.stringify({ api: "1" }, null, 2);
}

function website() {
  return `<div>
  <h1>Website</h1>
  <card is="/components/card"></card>
</div>`;
}

function dashboard() {
  return JSON.stringify({ dashboard: "1" }, null, 2);
}

function cli() {
  return `function cli() {} {
  return "bar";
}
`;
}
