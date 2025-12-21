import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editions")
    .select("publish_date")
    .order("publish_date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        We are facing some issues.
      </div>
    );
  }

  // console.log(`/edition/${data.publish_date}`);

  redirect(`/edition/${data.publish_date}`);
}
