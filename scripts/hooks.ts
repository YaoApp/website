import { QueryParams } from "@yao/runtime";

/**
 * Table before:search
 * Add order by sort
 * @param query
 * @param page
 * @param pagesize
 * @returns
 */
function OrderBySort(query: QueryParams, page, pagesize: number) {
  query.orders = [{ column: "sort", option: "asc" }];
  return [query, page, pagesize];
}
