import { Exception } from "@yao/runtime";
import { GetDSLByPage, ResetDSLByPage } from "@scripts/playground";

function LoadDSL(payload?: { url: string }) {
  if (!payload?.url) {
    throw new Exception("url is required", 400);
  }
  return GetDSLByPage(payload.url);
}

function ResetDSL(payload?: { url: string }) {
  if (!payload?.url) {
    throw new Exception("url is required", 400);
  }
  return ResetDSLByPage(payload.url);
}
