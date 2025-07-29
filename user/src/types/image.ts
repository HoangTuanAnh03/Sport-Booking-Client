export type VenueImage = {
  images: Image[];
  imageType: ImageType;
};

export type Image = {
  id: number;
  url: string;
};

export enum ImageType {
  DEFAULT = "DEFAULT",
  AVATAR = "AVATAR",
  THUMBNAIL = "THUMBNAIL",
}
