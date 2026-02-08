import { SignInButton } from "@clerk/nextjs";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import RequestClassCard from "./RequestClassCard";

type ClassRecord = {
  id: string;
  title: string;
  grade_range: string;
  age_range: string | null;
  capacity: number;
  size_tag: string | null;
  benefit_tags: string[];
  short_description: string | null;
};

const groupByGradeRange = (classes: ClassRecord[]) => {
  return classes.reduce<Record<string, ClassRecord[]>>((acc, entry) => {
    acc[entry.grade_range] = acc[entry.grade_range] ?? [];
    acc[entry.grade_range].push(entry);
    return acc;
  }, {});
};

export default async function ClassesPage() {
  const supabase = createSupabasePublicClient();
  const { data: classes, error } = await supabase
    .from("classes")
    .select(
      "id,title,grade_range,age_range,capacity,size_tag,benefit_tags,short_description"
    )
    .order("grade_range", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw error;
  }

  const grouped = groupByGradeRange(classes ?? []);
  const gradeRanges = Object.keys(grouped);

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-6 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600">Class Exploration</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Find the right math class for your learner
          </h1>
          <p className="text-sm text-slate-600">
            Browse by grade band, explore class options, or request a new class
            for your age group.
          </p>
          <div>
            <SignInButton mode="modal">
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
                Sign in
              </button>
            </SignInButton>
          </div>
        </header>

        {gradeRanges.length === 0 ? (
          <div className="grid gap-4">
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              No classes have been published yet.
            </div>
            <RequestClassCard />
          </div>
        ) : (
          <div className="space-y-4">
            {gradeRanges.map((gradeRange) => (
              <details
                key={gradeRange}
                className="rounded-2xl border border-slate-200 bg-white p-4"
                open
              >
                <summary className="cursor-pointer text-base font-semibold text-slate-900">
                  {gradeRange}
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {grouped[gradeRange].map((classItem) => (
                    <article
                      key={classItem.id}
                      className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {classItem.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="rounded-full bg-white px-2 py-1">
                            {classItem.grade_range}
                          </span>
                          {classItem.age_range ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              {classItem.age_range}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-white px-2 py-1">
                            Capacity {classItem.capacity}
                          </span>
                          {classItem.size_tag ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              {classItem.size_tag}
                            </span>
                          ) : null}
                        </div>
                        {classItem.short_description ? (
                          <p className="text-sm text-slate-600">
                            {classItem.short_description}
                          </p>
                        ) : null}
                      </div>
                      {classItem.benefit_tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-indigo-600">
                          {classItem.benefit_tags.map((tag) => (
                            <span
                              key={`${classItem.id}-${tag}`}
                              className="rounded-full bg-indigo-50 px-2 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                  <RequestClassCard gradeRange={gradeRange} />
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
