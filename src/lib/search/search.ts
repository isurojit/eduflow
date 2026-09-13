import { buildRevisionContent } from "@/lib/revision/content";
import type { EduFlowState } from "@/types/domain";

export type SearchResultKind = "subject" | "topic" | "note" | "bookmark" | "revision";
export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  href: string;
  searchableText: string;
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function buildSearchResults(state: EduFlowState): SearchResult[] {
  const results: SearchResult[] = [];
  for (const subject of state.subjects) {
    results.push({ id: `subject:${subject.id}`, kind: "subject", title: subject.name, subtitle: `${subject.topics.length} topics`, href: `/subjects/${subject.id}`, searchableText: subject.name });
    for (const topic of subject.topics) {
      const href = `/subjects/${subject.id}/topics/${topic.id}`;
      results.push({ id: `topic:${topic.id}`, kind: "topic", title: topic.name, subtitle: subject.name, href, searchableText: `${topic.name} ${topic.description ?? ""} ${subject.name}` });
      if (topic.bookmarked) results.push({ id: `bookmark:${topic.id}`, kind: "bookmark", title: topic.name, subtitle: `Important · ${subject.name}`, href, searchableText: `${topic.name} important bookmark ${subject.name}` });
      const revision = buildRevisionContent(subject.name, topic.name);
      if (revision) results.push({
        id: `revision:${topic.id}`,
        kind: "revision",
        title: topic.name,
        subtitle: `Revision · ${subject.name}`,
        href: `/revision/${subject.id}/${topic.id}`,
        searchableText: [topic.name, subject.name, revision.summary, ...revision.importantConcepts, ...revision.keyDefinitions.flatMap((item) => [item.term, item.definition]), ...revision.keyPoints].join(" "),
      });
    }
  }
  for (const note of state.notes) {
    const subject = state.subjects.find((item) => item.id === note.subjectId);
    const topic = subject?.topics.find((item) => item.id === note.topicId);
    results.push({ id: `note:${note.id}`, kind: "note", title: note.title, subtitle: [subject?.name, topic?.name].filter(Boolean).join(" · ") || "Note", href: `/notes?note=${note.id}`, searchableText: `${note.title} ${note.body} ${subject?.name ?? ""} ${topic?.name ?? ""}` });
  }
  return results;
}

export function searchEduFlow(state: EduFlowState, query: string, limit = 30) {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(" ").filter(Boolean);
  return buildSearchResults(state)
    .map((result) => {
      const text = normalize(`${result.title} ${result.subtitle} ${result.searchableText}`);
      const exactTitle = normalize(result.title) === q ? 100 : 0;
      const starts = normalize(result.title).startsWith(q) ? 30 : 0;
      const score = exactTitle + starts + terms.reduce((total, term) => total + (text.includes(term) ? 8 : 0), 0);
      return { result, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .slice(0, limit)
    .map((item) => item.result);
}
