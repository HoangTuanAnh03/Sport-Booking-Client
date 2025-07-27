export type UserReview = {
  uuid: string;
  name: string;
};

export type Review = {
  review_id: number;
  rating: number;
  comment: string;
  created_at: string; // Hoặc bạn có thể dùng `Date` nếu parse về
  user: UserReview;
};
