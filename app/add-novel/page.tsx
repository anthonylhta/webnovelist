import { redirect } from "next/navigation";

export default function AddNovelRedirect() {
  redirect("/admin/novels/new");
}
