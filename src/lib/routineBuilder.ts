import type { RoutineTask } from "@/store/routineStore";

export const ROUTINE_SCHEMA_VERSION = 3;
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

export function formatDateKey(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA");
}

function formatMinutes(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function chainSegments(segments: Segment[], startMinutes: number): RoutineTask[] {
  let cursor = startMinutes;
  return segments.map((segment, index) => {
    const startTime = formatMinutes(cursor);
    cursor += segment.duration;
    const endTime = formatMinutes(cursor);
    return {
      id: segment.id,
      title: segment.title,
      startTime,
      endTime,
      duration: segment.duration,
      order: index + 1,
      completed: false,
      category: segment.category,
    };
  });
}

function scaleStudyDuration(minutes: number): number {
  return Math.max(5, Math.round(minutes * 0.75));
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function eveningSegments(): Segment[] {
  return [
    { id: "dinner", title: "Dinner", duration: 30, category: "break" },
    { id: "dev-projects", title: "Coding / development", duration: 90, category: "study" },
    { id: "personal-projects", title: "Projects / building", duration: 45, category: "study" },
    { id: "games", title: "Games / entertainment", duration: 30, category: "other" },
    { id: "sleep", title: "Sleep", duration: 405, category: "other" },
  ];
}

function homeStudySegments(dateStr: string): Segment[] {
  const weekend = isWeekend(dateStr);
  const questionFocus = weekend ? " (Question solving / PYQs)" : "";

  const revision = scaleStudyDuration(35);
  const organize = scaleStudyDuration(30);
  const maths = scaleStudyDuration(120);
  const reasoning = scaleStudyDuration(60);
  const pyqs = scaleStudyDuration(90);
  const topicTest = scaleStudyDuration(60);
  const review = scaleStudyDuration(30);
  const deepStudy = scaleStudyDuration(120);

  // 09:30–21:00: the 25% study reduction becomes a real afternoon recovery block.
  return [
    { id: "revision", title: `Revision (formulas + questions)${questionFocus}`, duration: revision, category: "study" },
    { id: "organize", title: `Organize notes + choose question sets${questionFocus}`, duration: organize, category: "study" },
    { id: "maths", title: `Maths${weekend ? " (question solving / PYQs)" : " (concept + practice)"}`, duration: maths, category: "study" },
    { id: "break-midday", title: "Short break", duration: 15, category: "break" },
    { id: "reasoning", title: `Reasoning / Computer${questionFocus}`, duration: reasoning, category: "study" },
    { id: "lunch", title: "Lunch", duration: 30, category: "break" },
    { id: "pyqs", title: `PYQs + question practice${questionFocus}`, duration: pyqs, category: "study" },
    { id: "afternoon-free", title: "Afternoon rest + games + projects", duration: 130, category: "break" },
    { id: "break-afternoon", title: "Break", duration: 15, category: "break" },
    { id: "topic-test", title: `Topic test / sectional questions${questionFocus}`, duration: topicTest, category: "study" },
    { id: "review", title: "Review wrong questions", duration: review, category: "study" },
    { id: "walk-relax", title: "Walk / relax", duration: 90, category: "break" },
    { id: "deep-study", title: weekend ? "Mixed question-solving session" : "Deep study (weak topics)", duration: deepStudy, category: "study" },
  ];
}

export function buildCollegeDayRoutine(): RoutineTask[] {
  const segments: Segment[] = [
    { id: "wake", title: "Wake up, drink water", duration: 10, category: "other" },
    { id: "morning-prep", title: "Breakfast, freshen up, ghar ke kaam", duration: 110, category: "other" },
    { id: "travel-college", title: "College jaana (travel)", duration: 30, category: "other" },
    { id: "organize", title: "Organize notes", duration: 30, category: "study" },
    { id: "maths", title: "Maths", duration: 120, category: "study" },
    { id: "break-midday", title: "Break", duration: 15, category: "break" },
    { id: "reasoning", title: "Reasoning / Computer", duration: 60, category: "study" },
    { id: "lunch", title: "Lunch", duration: 30, category: "break" },
    { id: "pyqs", title: "PYQs + question practice", duration: 90, category: "study" },
    { id: "break-afternoon", title: "Break", duration: 15, category: "break" },
    { id: "topic-test", title: "Topic test / sectional test", duration: 60, category: "study" },
    { id: "review", title: "Review wrong questions", duration: 30, category: "study" },
    { id: "travel-home", title: "Head home", duration: 30, category: "other" },
    { id: "walk-relax", title: "Walk / relax", duration: 90, category: "break" },
    { id: "deep-study", title: "Deep study (weak topics)", duration: 120, category: "study" },
  ];

  return chainSegments([...segments, ...eveningSegments()], parseTime(WAKE_TIME));
}

export function buildHomeDayRoutine(dateStr: string): RoutineTask[] {
  const morning: Segment[] = [
    { id: "wake", title: "Wake up, drink water", duration: 10, category: "other" },
    { id: "morning-prep", title: "Breakfast, freshen up, ghar ke kaam", duration: 110, category: "other" },
    { id: "morning-chores", title: "Ghar ke kaam finish karna", duration: 30, category: "other" },
  ];

  return chainSegments([...morning, ...homeStudySegments(dateStr), ...eveningSegments()], parseTime(WAKE_TIME));
}

export function buildRoutineForDay(dateStr: string, goingToCollege: boolean): RoutineTask[] {
  return goingToCollege ? buildCollegeDayRoutine() : buildHomeDayRoutine(dateStr);
}

export function getTodayDateKey(): string {
  return formatDateKey();
}

export function isCollegeQuestionOpen(now = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < parseTime(COLLEGE_QUESTION_DEADLINE);
}
