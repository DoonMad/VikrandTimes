import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function Archive({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editions")
    .select("publish_date")
    .order("publish_date", { ascending: false })
    .range(from, to);

  if (error) {
    return <p>Error loading archive</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Archive</h1>

      <ul className="space-y-2">
        {data?.map((edition) => (
          <li key={edition.publish_date}>
            <Link
              href={`/edition/${edition.publish_date}`}
              className="text-red-700 hover:underline"
            >
              Edition - {edition.publish_date}
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        {currentPage > 1 && (
          <Link href={`/archive?page=${currentPage - 1}`}>
            ← Prev
          </Link>
        )}

        {data && data.length === PAGE_SIZE && (
          <Link href={`/archive?page=${currentPage + 1}`}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
