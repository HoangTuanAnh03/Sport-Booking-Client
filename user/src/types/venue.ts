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
  venue_id: string;
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
  venue_id: string;
  venue_name: string;
  venue_address: string;
  status: string;
  phone_number: string;
  opening: string;
  closing: string;
  images: {
    thumbnail: string;
    cover: string;
    default: string[];
  };
  latitude: string;
  longitude: string;
  distance: number;
};

type CoordinateVenue = {
  id: string;
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
