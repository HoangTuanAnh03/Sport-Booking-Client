export {};
// https://bobbyhadz.com/blog/typescript-make-types-global#declare-global-types-in-typescript

declare global {
  type IBackendRes<T> = {
    code: number;
    data?: T;
  };

  interface PagingResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  }
}
