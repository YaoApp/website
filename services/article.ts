import { Exception, Process } from "@yao/runtime";

function UpdateStatus(data: Record<string, any>) {
  const { id, status } = data;
  if (!id || !status) {
    throw new Exception("Invalid parameters", 400);
  }

  // check status 'published' or 'draft'
  if (status != "published" && status != "draft") {
    throw new Exception("Invalid status", 400);
  }

  // if status is 'published', check if the article has a title and slug
  if (status == "published") {
    const article = Process("models.article.find", id, {});
    if (!article.title || !article.slug) {
      throw new Exception(
        `Article ${!article.title ? "title" : "slug"} are required to publish`,
        400
      );
    }
  }

  // publish or unpublish the article
  Process("models.article.update", id, { status });
  const message =
    status == "published"
      ? "Published successfully"
      : "Unpublished successfully";

  return { code: 200, message: message };
}
