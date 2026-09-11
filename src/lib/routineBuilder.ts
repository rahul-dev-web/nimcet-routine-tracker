import type { RoutineTask, UserProfile } from "@/store/routineStore";

export const ROUTINE_SCHEMA_VERSION = 4;
export const COLLEGE_QUESTION_DEADLINE = "09:00";

export type Segment = {
  id: string;
  title: string;
  duration: number;
  category: RoutineTask["category"];
};

export function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatDateKey(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA");
}

export function getLocalTimeMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
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
    return { id: segment.id, title: segment.title, startTime, endTime, duration: segment.duration, order: index + 1, completed: false, category: segment.category };
  });
}

function scaleStudySegments(segments: Segment[], targetHours: number): Segment[] {
  const study = segments.filter((segment) => segment.category === "study");
  if (!study.length) return segments;
  const targetMinutes = Math.max(60, Math.round(targetHours * 60));
  const currentMinutes = study.reduce((sum, segment) => sum + segment.duration, 0);
  if (!currentMinutes) return segments;

  const scaled = new Map<string, number>();
  let assigned = 0;
  study.forEach((segment, index) => {
    const duration = index === study.length - 1
      ? Math.max(5, targetMinutes - assigned)
      : Math.max(5, Math.round((segment.duration / currentMinutes) * targetMinutes));
    scaled.set(segment.id, duration);
    assigned += duration;
  });
  return segments.map((segment) => segment.category === "study" ? { ...segment, duration: scaled.get(segment.id) ?? segment.duration } : segment);
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function minutesUntilNextTime(fromMinutes: number, targetTime: string): number {
  const target = parseTime(targetTime);
  const diff = target - fromMinutes;
  return diff > 0 ? diff : diff + 24 * 60;
}

function eveningSegments(profile: UserProfile, startMinutes: number): Segment[] {
  const preSleep: Segment[] = [
    { id: "dinner", title: "Dinner", duration: 30, category: "break" },
    { id: "dev-projects", title: "Coding / development", duration: 90, category: "study" },
    { id: "personal-projects", title: "Projects / building", duration: 45, category: "study" },
    { id: "games", title: "Games / entertainment", duration: 30, category: "other" },
  ];
  const preSleepEnd = startMinutes + preSleep.reduce((sum, segment) => sum + segment.duration, 0);
  const sleepDuration = Math.max(30, minutesUntilNextTime(preSleepEnd % (24 * 60), profile.sleepTime));
  return [...preSleep, { id: "sleep", title: "Sleep", duration: sleepDuration, category: "other" }];
}

function homeStudySegments(dateStr: string): Segment[] {
  const weekend = isWeekend(dateStr);
  const questionFocus = weekend ? " (Question solving / PYQs)" : "";
  return [
    { id: "revision", title: `Revision (formulas + questions)${questionFocus}`, duration: 35, category: "study" },
    { id: "organize", title: `Organize notes + choose question sets${questionFocus}`, duration: 30, category: "study" },
    { id: "maths", title: `Maths${weekend ? " (question solving / PYQs)" : " (concept + practice)"}`, duration: 120, category: "study" },
    { id: "break-midday", title: "Short break", duration: 15, category: "break" },
    { id: "reasoning", title: `Reasoning / Computer${questionFocus}`, duration: 60, category: "study" },
    { id: "lunch", title: "Lunch", duration: 30, category: "break" },
    { id: "pyqs", title: `PYQs + question practice${questionFocus}`, duration: 90, category: "study" },
    { id: "afternoon-free", title: "Afternoon rest + games + projects", duration: 130, category: "break" },
    { id: "break-afternoon", title: "Break", duration: 15, category: "break" },
    { id: "topic-test", title: `Topic test / sectional questions${questionFocus}`, duration: 60, category: "study" },
    { id: "review", title: "Review wrong questions", duration: 30, category: "study" },
    { id: "walk-relax", title: "Walk / relax", duration: 90, category: "break" },
    { id: "deep-study", title: weekend ? "Mixed question-solving session" : "Deep study (weak topics)", duration: 120, category: "study" },
  ];
}

export function buildCollegeDayRoutine(profile: UserProfile): RoutineTask[] {
  const startMinutes = parseTime(profile.wakeUpTime);
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
  const beforeEvening = segments.reduce((sum, segment) => sum + segment.duration, 0);
  return chainSegments(scaleStudySegments([...segments, ...eveningSegments(profile, startMinutes + beforeEvening)], profile.studyTargetHours), startMinutes);
}

export function buildHomeDayRoutine(dateStr: string, profile: UserProfile): RoutineTask[] {
  const startMinutes = parseTime(profile.wakeUpTime);
  const morning: Segment[] = [
    { id: "wake", title: "Wake up, drink water", duration: 10, category: "other" },
    { id: "morning-prep", title: "Breakfast, freshen up, ghar ke kaam", duration: 110, category: "other" },
    { id: "morning-chores", title: "Ghar ke kaam finish karna", duration: 30, category: "other" },
  ];
  const beforeEvening = [...morning, ...homeStudySegments(dateStr)].reduce((sum, segment) => sum + segment.duration, 0);
  return chainSegments(scaleStudySegments([...morning, ...homeStudySegments(dateStr), ...eveningSegments(profile, startMinutes + beforeEvening)], profile.studyTargetHours), startMinutes);
}

export function buildRoutineForDay(dateStr: string, goingToCollege: boolean, profile: UserProfile): RoutineTask[] {
  return goingToCollege ? buildCollegeDayRoutine(profile) : buildHomeDayRoutine(dateStr, profile);
}

export function getTodayDateKey(): string { return formatDateKey(); }

export function isCollegeQuestionOpen(now = new Date()): boolean {
  return getLocalTimeMinutes(now) < parseTime(COLLEGE_QUESTION_DEADLINE);
}
