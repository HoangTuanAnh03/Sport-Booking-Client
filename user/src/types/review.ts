export type UserReview = {
  uuid: string;
  name: string;
};

export type Review = {
  id: number;
  name: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewRequest = {
  rating: number; // 1-5
  comment: string; // max 1000 characters
  venueId: number;
};
