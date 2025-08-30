import { redirect } from "next/navigation";

export default function Home() {
  redirect("/users");

  return <main></main>;
}
