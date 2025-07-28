type Coord = [lng: number, lat: number];

type VenueMap = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  sport_types: number[];
};

type Venue = {
  venue_id: number;
  venue_name: string;
  venue_address: string;
  phone_number: string;
  image_cover: string;
  thumbnail: string;
  opening: string;
  closing: string;
  status: string;
};

type VenueDetail = {
  id: number;
  name: string;
  address: string;
  status: string;
  phoneNumber: string;
  openTime: string;
  closeTime: string;
  rating: number;
  totalReviews: number;
  distance: number;
  images: {
    thumbnail: string;
    avatar: string;
  };
};

type CoordinateVenue = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: SportTypeEnum;
};

type SportType = {
  id: number;
  name: string;
};

enum SportTypeEnum {
  BADMINTON = 1,
  FOOTBALL = 2,
  TENNIS = "tennis",
  TABLE_TENNIS = "table_tennis",
  SQUASH = "squash",
  PICKLEBALL = "pickleball",
  BASKETBALL = "basketball",
  VOLLEYBALL = "volleyball",
  HOCKEY = "hockey",
  ICE_HOCKEY = "ice_hockey",
}
