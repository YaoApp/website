const root = $(arguments[0]);
const content = root.find("[content]");
const loading = root.find("[loading]");

function Init() {
  const { Remarkable } = remarkable;

  // Replace the HTML entities with the actual characters
  // &nbsp; &lt; &gt; &amp; &quot; &apos; &copy; &reg;
  const raw = (content.find("#markdown").html() || "Not Found")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®");

  const parser = new Remarkable({
    Remarkable: true,
  });

  // Custom component tag support
  // Example:{{< example id="edit/select/basic" height="200px" >}}
  // It will request the page /example/[id] in an iframe, and the height of the iframe will be 200px, if height is not provided, it will default to 300px.
  parser.renderer.rules.component = componentRender;
  parser.inline.ruler.before("text", "component", componentParser);

  // Add custom rule for the code block
  parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const lang = token.params || "teplaintextxt";
    const languageClass = `language-${lang}`;
    const content = highlight(token.content, lang);
    return `<pre class="code-canvas ${languageClass}"><code>${content}</code></pre>`;
  };

  const html = parser.render(raw);
  content.html(html);
  const outline = outlineParser();
  $("#outline").trigger("change", [outline]);
  content.removeClass("hidden");
  loading.addClass("hidden");
}

function outlineParser() {
  const scrollTo = (elm) => {
    const offset = 96; // Adjust this value to offset the scroll position
    const target = $(elm);
    if (target.length > 0) {
      const top = target.offset().top || false;
      if (top) {
        window.scrollTo({ top: top - offset, behavior: "smooth" });
        // Update the URL without refreshing the page
        if (history.pushState) {
          history.pushState(null, null, elm);
        } else {
          location.hash = elm;
        }
      }
    }
  };

  const outline = [];
  const titles = content.find("h2") || [];
  titles.each((index, title) => {
    const text = $(title).text();
    const id = text.toLowerCase().replace(/ /g, "-");
    $(title).attr("id", id);
    $(title).addClass("hover:text-blue-500 cursor-pointer");
    $(title).on("click", () => {
      scrollTo(`#${escapeJQuerySelector(id)}`);
    });
    outline.push({ id, title: text, link: `#${id}` });
  });

  // Link to the section #xxx
  const linksWithHashs = document.querySelectorAll('a[href^="#"]') || [];
  linksWithHashs.forEach((link) => {
    $(link).on("click", (e) => {
      e.preventDefault();
      const href = $(link).attr("href");
      scrollTo(href);
    });
  });

  return outline;
}

/**
 *  A custom parser for the component tag
 * @param {*} state
 * @param {*} startLine
 * @param {*} endLine
 * @param {*} silent
 * @returns
 */
function componentParser(state, startLine, endLine, silent) {
  const start = state.pos;

  // Custom tag should start with "{{<" end with ">}}"
  if (
    state.src.charCodeAt(start) !== 123 ||
    state.src.charCodeAt(start + 1) !== 123 ||
    state.src.charCodeAt(start + 2) !== 60
  ) {
    return false;
  }

  // Find the end of the tag
  const tagEnd = state.src.indexOf(">}}", start + 3);
  if (tagEnd === -1) {
    return false;
  }

  if (silent) {
    return true; // Don't output anything, only check for match
  }

  // Extract the tag content
  const content = state.src.slice(start + 3, tagEnd).trim();

  // Parse the tag content
  const parts = content.split(" ");
  if (parts.length < 2) {
    return false;
  }

  const name = parts[0].trim();
  const query = parts.slice(1);
  const params = {};
  query.forEach((q) => {
    let [key, value] = q.split("=");
    key = key.trim();
    value = value.trim().replace(/"/g, "").replace(/'/g, "");
    params[key] = value;
  });

  if (!params.id || params.id.length == "") {
    return false;
  }

  // Skip the tag content and closing ">}}"
  state.pos = tagEnd + 3;

  // Add a token for the custom tag
  state.tokens.push({
    type: "component",
    params: { name: name, ...params },
    content: content,
  });
  return true;
}

/**
 * A custom renderer for the component tag
 * @param {*} tokens
 * @param {*} idx
 * @returns
 */
function componentRender(tokens, idx) {
  const name = tokens[idx].params.name;
  const is = tokens[idx].params.id;
  const height = tokens[idx].params.height || "300px";
  const url = `/${name}/${is}`;
  const id = `${name}-${is}`.replace(/\//g, "-");
  return `
  <div style="height: ${height};" class="overflow-hidden relative">
    <div id="${id}" class="flex justify-center items-center h-full animate-spin">
        <span class="material outlined text-gray-400 text-2xl">autorenew</span>
    </div>
    <iframe src="${url}" onload="$('#${id}').hide();$(this).show();" style="width: 100%; height: ${height}; border: none; display:none "></iframe>
  </div>
  `;
}

/**
 * syntax highlighting
 * @param {*} str
 * @param {*} lang
 * @returns
 */
function highlight(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      }).value;
    } catch (err) {}
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {}

  return ""; // use external default escaping
}

function escapeJQuerySelector(id) {
  return id.replace(/([ ;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
}

Init();
