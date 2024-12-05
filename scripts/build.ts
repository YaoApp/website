import { FS } from "@yao/runtime";
import { Locale } from "@yao/sui";
/**
 * Replace the Development Block with the Production Block
 * @param root
 */
function Before(root: string) {
  console.log("Build Started");
  //  Find the Development Block in  <!-- Development --> to <!-- Development END--> \n and replace it with the Production Block
  const blockRe =
    /<!-- Development -->\s*\n*([\s\S]*?)\s*<!--  Development END-->/g;

  const fs = new FS("data");
  //   backup the document
  fs.Copy(root + "/__document.html", root + "/__document.html.bak");
  const document = fs.ReadFile(root + "/__document.html");

  // Replace the Development Block with the Production Block
  const productionBlock = `<link href="@assets/css/tailwind.min.css" rel="stylesheet" />`;
  const newDocument = document.replace(blockRe, productionBlock);
  fs.WriteFile(root + "/__document.html", newDocument);
}

function After(root: string) {
  console.log("Build Done Successfully");
  // resetDocument(root);
}

function Complete(root: string) {
  console.log("Build Complete");
  resetDocument(root);
}

function resetDocument(root: string) {
  const fs = new FS("data");
  fs.Remove(root + "/__document.html");
  fs.Move(root + "/__document.html.bak", root + "/__document.html");
  fs.Remove(root + "/__document.html.bak");
}
