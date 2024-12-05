import { Exception, FS } from "@yao/runtime";

/**
 * Allowed Widgets
 */
export const AllowedWidgets = {
  Table: { root: "/tables", ext: ".tab.yao" },
  Form: { root: "/forms", ext: ".form.yao" },
};

/**
 * Editable Widgets
 */
export const EditableWidgets = {
  Table: { "tests.article": true },
  Form: { "tests.article": true },
};

/**
 * Save Page DSL
 */
function Save(payload: Record<string, any>) {
  const { url, dsl } = payload;
  const { status, path } = GetDSLByPage(url, false);
  if (status === "readonly") {
    throw new Exception("This widget is not editable", 403);
  }

  const fs = new FS("app");
  const ts = new Date().getTime().toString();
  const backupPath = `${path}.${ts}.bak`;
  fs.Move(path, backupPath); // Backup the existing file
  fs.WriteFile(path, dsl); // Write the new file
  return ts;
}

export function ResetDSLByPage(pageURL: string) {
  const dsl = GetDSLByPage(pageURL, false);
  if (dsl.status === "readonly") {
    throw new Exception("This widget is not editable", 403);
  }
  const fs = new FS("app");
  let source = "";
  switch (dsl.type) {
    case "Table":
      source = fs.ReadFile("/tables/article.tab.yao");
      fs.WriteFile(dsl.path, source);
      return GetDSLByPage(pageURL);

    case "Form":
      source = fs.ReadFile("/forms/article.form.yao");
      fs.WriteFile(dsl.path, source);
      return GetDSLByPage(pageURL);
  }

  throw new Exception("Type %s not supported", 400, dsl.type);
}

/**
 * Get DSL source code by page URL
 */
export function GetDSLByPage(pageURL: string, source: boolean = true) {
  if (!pageURL) {
    throw new Exception("url is required", 400);
  }

  var re = /\/x\/([^\/]+)\/([^\/]+)/;
  const url = decodeHtmlEntity(pageURL);
  const matches = url.match(re);
  if (!matches) {
    throw new Exception("Please enter table or form url", 400);
  }

  const [_, type, id] = matches;
  const widget = AllowedWidgets[type];
  if (!widget) {
    throw new Exception(
      "Not a valid widget, Only Tabel and Form are allowed",
      400
    );
  }

  const path = `${widget.root}/${id.replace(".", "/").toLowerCase()}${
    widget.ext
  }`;
  const status = EditableWidgets[type][id] ? "editable" : "readonly";

  if (!source) {
    return { status: status, path: path, type: type, id: id };
  }

  const fs = new FS("app");
  if (!fs.Exists(path)) {
    throw new Exception("DSL not found", 404);
  }
  const dsl = fs.ReadFile(path);
  return {
    code: 200,
    message: "DSL Load successfully",
    status: status,
    source: dsl,
    type: type,
    id: id,
  };
}

function decodeHtmlEntity(encodedStr: string) {
  return encodedStr
    .replace(/&#x[0-9A-Fa-f]+;/g, (match) => {
      return String.fromCharCode(
        parseInt(match.replace("&#x", "").replace(";", ""), 16)
      );
    })
    .replace(/&#[0-9]+;/g, (match) => {
      return String.fromCharCode(
        parseInt(match.replace("&#", "").replace(";", ""), 10)
      );
    });
}
