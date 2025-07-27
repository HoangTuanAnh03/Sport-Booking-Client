
export type OpeningHour = {
    field_id: string;
    day_of_week: string;
    opening_time: string;
    closing_time: string;
}

export type Field = {
    field_id: string;
    venue_id: string;
    sport_type_id: number;
    field_name: string;
    default_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    opening_hour_today?: OpeningHour;
}