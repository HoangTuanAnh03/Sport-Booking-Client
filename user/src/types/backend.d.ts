export {};
// https://bobbyhadz.com/blog/typescript-make-types-global#declare-global-types-in-typescript

declare global {
  type IBackendRes<T> = {
    code: number;
    data?: T;
  };

  type IModelPaginate<T> = {
    current_page: number;
    data: T;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };

  type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
  };

  type IModelSpecificationRequest = {
    filter: string;
  };

  type IModelPaginateResponse<T> = {
    current_page: number;
    data: T;
    first_page_url: string;
    from: number;
    last_page_url: string;
    last_page: number;
    next_page_url: ?string;
    path: string;
    per_page: number;
    prev_page_url: ?string;
    to: number;
    total: number;
    links: PaginateLink[];
  };

  type PaginateLink = {
    url: ?string;
    label: string;
    active: boolean;
  };
}
