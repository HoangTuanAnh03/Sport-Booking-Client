import { Suspense } from "react";
import BookingComponent from "./BookingComponent";

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPage />
    </Suspense>
  );
}
