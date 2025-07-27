export type TimeSlot = {
    start_time: string;
    end_time: string;
    time: string;
    price: number;
    status: string;
    min_rental: number;
    colspan: number;
}

export type Court = {
    name: string;
    time_slots: TimeSlot[];
};

export type CourtMap = {
    [courtId: string]: Court;
};

export type TimeLineEl = {
    start_time: string;
    end_time: string;
    time: string;
    duration: number;
}

export type PaymentInf = {
    booking_id: string;
    total_price: number;
    bank_name: string;
    bank_account: string;
    qr_url: string;
    message: string;
}

type CourtSlot = {
    start_time: string;
    end_time: string;
};

type CourtBooking = {
    [courtId: string]: CourtSlot[];
};

export type BookingRequest = {
    field_id: string;
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    court: CourtBooking;
};

export type CourtByField = {
    base_time_line: TimeLineEl[];
    courts: CourtMap;
}