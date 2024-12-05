export const ParseJSON = (content: string): any => {
  content = (content || "").trim();
  const re = /```jsonc?([\s\S]+)```/g;
  const matches = content.match(re);
  if (matches) {
    content = matches[0].replace(/```jsonc?/g, "").replace(/```/g, "");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    return { error: error.message };
  }
};
