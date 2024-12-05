/**
 *  Add the test data here
 */

import { FS, Process } from "@yao/runtime";

/**
 * Add the test data here
 * yao run scripts.test.Data
 */
function Data() {
  const imports = [
    { model: "article", path: "/tests/article.json" },
    { model: "article.category", path: "/tests/article/category.json" },
    { model: "tutorial", path: "/tests/tutorial.json" },
    { model: "tutorial.category", path: "/tests/tutorial/category.json" },
    { model: "release", path: "/tests/release.json" },
  ];

  imports.forEach((item) => {
    clearData(item.model);
    const data = getData(item.path);
    insertData(data, item.model);
  });

  return { status: "success" };
}

function clearData(model: string) {
  Process(`models.${model}.Migrate`);
}
function insertData(rows: Record<string, any>[], model: string) {
  Process(`models.${model}.EachSave`, rows);
}

function getData(path: string) {
  const fs = new FS("data");
  const raw = fs.ReadFile(path);
  return JSON.parse(raw);
}
