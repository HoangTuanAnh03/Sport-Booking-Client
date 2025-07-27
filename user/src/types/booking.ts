export type CourtSlot = {
  court_id: string;
  court_name: string;
  start_time: string;
  end_time: string;
  date: string;
};

export type Booking = {
  booking_id: string;
  total_price: string;
  venue_name: string;
  venue_address: string;
  field_name: string;
  court_slots: CourtSlot[];
  status: string;
  created_at: string;
};
