function Init(component) {
  const input = component.querySelector("input");
  const value = input.dataset.value || false;
  if (value === "1" || value === "true" || value === true || value === 1) {
    input.checked = true;
  }
}

Init(arguments[0]);
