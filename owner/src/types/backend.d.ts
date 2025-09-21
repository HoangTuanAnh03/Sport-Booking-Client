export {};
// https://bobbyhadz.com/blog/typescript-make-types-global#declare-global-types-in-typescript

declare global {
  type IBackendRes<T> = {
    code: number;
    data?: T;
  };

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface PagingResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  }
}
