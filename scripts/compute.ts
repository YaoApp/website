function JsonText(v) {
  return JSON.stringify(v, null, 2);
}

function FormTitle(v) {
  if (!v?.form?.title && !v?.form?.label) {
    return "Untitled";
  }
  return v?.form?.label || v?.form?.title;
}
