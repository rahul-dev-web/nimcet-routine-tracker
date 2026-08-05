import type { RoutineTask } from "@/store/routineStore";

export const ROUTINE_SCHEMA_VERSION = 2;
export const COLLEGE_QUESTION_DEADLINE = "09:00";
export const WAKE_TIME = "07:00";
export const SLEEP_END = "07:00";

type Segment = {
  id: string;
  title: string;
  duration: number;
  category: RoutineTask["category"];
};

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function chainSegments(segments: Segment[], startMinutes: number): RoutineTask[] {
  let cursor = startMinutes;
  return segments.map((seg, index) => {
    const startTime = formatMinutes(cursor);
    cursor += seg.duration;
    const endTime = formatMinutes(cursor);
    return {
      id: seg.id,
      title: seg.title,
      startTime,
      endTime,
      duration: seg.duration,
      order: index + 1,
      completed: false,
      category: seg.category,
    };
  });
}

function scaleStudyDuration(minutes: number, scale: number): number {
  return Math.max(5, Math.round(minutes * scale));
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function eveningSegments(): Segment[] {
  return [
    { id: "dinner", title: "Dinner", duration: 30, category: "break" },
    { id: "dev-projects", title: "Development / Projects", duration: 60, category: "study" },
    { id: "daily-revision", title: "Daily revision + plan for tomorrow", duration: 30, category: "study" },
    { id: "games", title: "Games / entertainment", duration: 30, category: "other" },
    { id: "sleep", title: "Sleep", duration: 450, category: "other" },
  ];
}

function homeStudySegments(dateStr: string, studyScale: number): Segment[] {
  const weekend = isWeekend(dateStr);

  const mathsTitle = weekend
    ? "Maths (Question solving / PYQs)"
    : "Maths (Concept + Practice)";
  const reasoningTitle = weekend
    ? "Reasoning / Computer (Question solving)"
    : "Reasoning / Computer";
  const organizeTitle = weekend
    ? "Organize notes + pick PYQ sets"
    : "Organize notes / plan";
  const deepStudyTitle = weekend
    ? "Question solving marathon (mixed topics)"
    : "Deep Study (Weak topics)";

  const revision = scaleStudyDuration(35, studyScale);
  const organize = scaleStudyDuration(30, studyScale);
  const maths = scaleStudyDuration(120, studyScale);
  const reasoning = scaleStudyDuration(60, studyScale);
  const pyqs = scaleStudyDuration(90, studyScale);
  const topicTest = scaleStudyDuration(60, studyScale);
  const review = scaleStudyDuration(30, studyScale);
  const deepStudy = scaleStudyDuration(120, studyScale);

  const originalStudy =
    35 + 30 + 120 + 60 + 90 + 60 + 30 + 120;
  const scaledStudy = revision + organize + maths + reasoning + pyqs + topicTest + review + deepStudy;
  const freedMinutes = originalStudy - scaledStudy;

  const segments: Segment[] = [
    { id: "revision", title: "Revision (Flashcards/Formula)", duration: revision, category: "study" },
    { id: "organize", title: organizeTitle, duration: organize, category: "study" },
    { id: "maths", title: mathsTitle, duration: maths, category: "study" },
    { id: "break-midday", title: "Break", duration: 15, category: "break" },
    { id: "reasoning", title: reasoningTitle, duration: reasoning, category: "study" },
    { id: "lunch", title: "Lunch", duration: 30, category: "break" },
    { id: "pyqs", title: "PYQs + Question Practice", duration: pyqs, category: "study" },
    { id: "break-afternoon", title: "Break", duration: 15, category: "break" },
    { id: "topic-test", title: "Topic Test / Sectional Test", duration: topicTest, category: "study" },
    { id: "review", title: "Review wrong questions", duration: review, category: "study" },
  ];

  if (freedMinutes >= 15) {
    segments.push({
      id: "afternoon-free",
      title: "Rest + games + personal projects",
      duration: freedMinutes,
      category: "break",
    });
  }

  segments.push(
    { id: "walk-relax", title: "Walk / relax", duration: 90, category: "break" },
    { id: "deep-study", title: deepStudyTitle, duration: deepStudy, category: "study" },
  );

  return segments;
}

export function buildCollegeDayRoutine(): RoutineTask[] {
  const morning: Segment[] = [
    { id: "wake", title: "Wake up, drink water", duration: 10, category: "other" },
    {
      id: "morning-prep",
      title: "Breakfast, freshen up, ghar ke kaam",
      duration: 110,
      category: "other",
    },
    { id: "travel-college", title: "College jaana (travel)", duration: 30, category: "other" },
    {
      id: "college-dev-block",
      title: "Coding, development, projects & games",
      duration: 165,
      category: "other",
    },
    { id: "college-nap", title: "Sleep / rest", duration: 405, category: "other" },
    { id: "deep-study", title: "Deep Study (Weak topics)", duration: 120, category: "study" },
  ];

  const start = parseTime(WAKE_TIME);
  return chainSegments([...morning, ...eveningSegments()], start);
}

export function buildHomeDayRoutine(dateStr: string): RoutineTask[] {
  const morning: Segment[] = [
    { id: "wake", title: "Wake up, drink water", duration: 10, category: "other" },
    {
      id: "morning-prep",
      title: "Break, freshen up, ghar ke kaam",
      duration: 140,
      category: "other",
    },
  ];

  const studyScale = 0.75;
  const start = parseTime(WAKE_TIME);
  return chainSegments([...morning, ...homeStudySegments(dateStr, studyScale), ...eveningSegments()], start);
}

export function buildRoutineForDay(dateStr: string, goingToCollege: boolean): RoutineTask[] {
  if (goingToCollege) {
    return buildCollegeDayRoutine();
  }
  return buildHomeDayRoutine(dateStr);
}

export function getTodayDateKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function isCollegeQuestionOpen(now = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < parseTime(COLLEGE_QUESTION_DEADLINE);
}
