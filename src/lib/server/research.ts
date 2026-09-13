import type { ResearchResult } from "@/types/cloud";

function stripHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchResearch(query: string): Promise<ResearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const results: ResearchResult[] = [];
  const [wiki, openAlex, crossref] = await Promise.allSettled([
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=5`,
      { next: { revalidate: 3600 } },
    ).then((r) => r.json()),
    fetch(
      `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=5${process.env.OPENALEX_EMAIL ? `&mailto=${encodeURIComponent(process.env.OPENALEX_EMAIL)}` : ""}`,
      { next: { revalidate: 3600 } },
    ).then((r) => r.json()),
    fetch(
      `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=5`,
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": `EduFlow/1.0${process.env.OPENALEX_EMAIL ? ` (mailto:${process.env.OPENALEX_EMAIL})` : ""}`,
        },
      },
    ).then((r) => r.json()),
  ]);
  if (wiki.status === "fulfilled")
    for (const item of wiki.value?.query?.search ?? [])
      results.push({
        id: `wiki-${item.pageid}`,
        source: "Wikipedia",
        title: item.title,
        snippet: stripHtml(item.snippet),
        url: `https://en.wikipedia.org/?curid=${item.pageid}`,
      });
  if (openAlex.status === "fulfilled")
    for (const item of openAlex.value?.results ?? [])
      results.push({
        id: item.id,
        source: "OpenAlex",
        title: item.display_name,
        snippet: item.primary_topic?.display_name
          ? `Research topic: ${item.primary_topic.display_name}`
          : "Academic work indexed by OpenAlex.",
        url: item.doi || item.id,
        year: item.publication_year,
        authors: (item.authorships || [])
          .slice(0, 4)
          .map(
            (a: { author?: { display_name?: string } }) =>
              a.author?.display_name,
          )
          .filter(Boolean),
      });
  if (crossref.status === "fulfilled")
    for (const item of crossref.value?.message?.items ?? [])
      results.push({
        id: `crossref-${item.DOI}`,
        source: "Crossref",
        title: item.title?.[0] || item.DOI,
        snippet: stripHtml(
          item.abstract ||
            item["container-title"]?.[0] ||
            "Scholarly work indexed by Crossref.",
        ),
        url: item.URL || `https://doi.org/${item.DOI}`,
        year: item.published?.["date-parts"]?.[0]?.[0],
        authors: (item.author || [])
          .slice(0, 4)
          .map((a: { given?: string; family?: string }) =>
            [a.given, a.family].filter(Boolean).join(" "),
          ),
      });
  return results.slice(0, 15);
}
