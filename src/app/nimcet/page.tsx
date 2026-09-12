"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { NIMCET_SYLLABUS } from "@/lib/nimcetSyllabus";
import { accuracyOf, resultTotal, validateQuestionTotals } from "@/lib/nimcetTrackerMetrics";
import { useNimcetStore } from "@/store/nimcetStore";

type AssessmentTab = "dpp" | "mock" | "pyq";

const today = () => new Date().toLocaleDateString("en-CA");

export default function NimcetPage() {
  const store = useNimcetStore();
  const [tab, setTab] = useState<AssessmentTab>("dpp");
  const [date, setDate] = useState(today());
  const [studyTopicIds, setStudyTopicIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [title, setTitle] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [paper, setPaper] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    store.load();
    setLoaded(true);
  }, []);

  const validTotal = resultTotal({ questionCount, correct, wrong, skipped });
  const remaining = questionCount - validTotal;
  const validResults = validateQuestionTotals({ questionCount, correct, wrong, skipped }) && questionCount > 0;
  const todayStudyTopics = store.dailyTopics[date]?.topicIds ?? [];

  const resetAssessment = () => {
    setTopicIds([]);
    setQuestionCount(20);
    setCorrect(0);
    setWrong(0);
    setSkipped(0);
    setTitle("");
    setUnitTitle("");
    setYear(new Date().getFullYear());
    setPaper("");
    setDurationMinutes(0);
  };

  const toggleTopic = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string, checked: boolean) => {
    setter((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  };

  const handleNumber = (setter: React.Dispatch<React.SetStateAction<number>>) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(Math.max(0, Math.floor(Number(event.target.value) || 0)));
  };

  const saveTopicsStudied = () => {
    if (!loaded || !studyTopicIds.length) return;
    store.recordDailyTopics(date, studyTopicIds);
  };

  const saveAssessment = () => {
    if (!loaded || !validResults || !topicIds.length) return;
    if (tab === "dpp") {
      store.saveDpp({ date, topicIds, questionCount, correct, wrong, skipped, completed: true });
    } else if (tab === "mock") {
      if (!unitTitle.trim()) return;
      store.saveMock({ date, title: title.trim() || `${unitTitle.trim()} Mock`, unitTitle: unitTitle.trim(), subjectIds: [], topicIds, questionCount, correct, wrong, skipped, durationMinutes: durationMinutes || undefined, completed: true });
    } else {
      if (!title.trim() || year < 2000) return;
      store.savePyq({ date, title: title.trim(), year, paper: paper.trim() || undefined, subjectIds: [], topicIds, questionCount, correct, wrong, skipped, durationMinutes: durationMinutes || undefined, completed: true });
    }
    resetAssessment();
  };

  const topicGroups = useMemo(() => NIMCET_SYLLABUS, []);
  const dppRecords = store.dpps.slice().reverse();
  const mocks = store.assessments.filter((record) => record.type === "mock").slice().reverse();
  const pyqs = store.assessments.filter((record) => record.type === "pyq").slice().reverse();

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide opacity-60">NIMCET Preparation</p>
        <h1 className="text-3xl font-bold">Practice & Tests</h1>
        <p className="mt-2 max-w-3xl opacity-70">Track what you studied, your daily DPP result, and unit mocks. DPP stores only aggregate counts — individual questions are not required.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <TabButton active={tab === "dpp"} onClick={() => setTab("dpp")} title="Daily DPP" description="Daily topic-wise practice" />
        <TabButton active={tab === "mock"} onClick={() => setTab("mock")} title="Unit Mock" description="Take after completing a unit" />
        <TabButton active={tab === "pyq"} onClick={() => setTab("pyq")} title="PYQs" description="Supported, but optional for now" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-5 rounded-2xl border p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="text-xl font-semibold">Topics studied</h2><p className="text-sm opacity-65">Mark the topics you actually studied on this date.</p></div>
            <input type="date" className="rounded-lg border p-3" value={date} onChange={(e) => { setDate(e.target.value); setStudyTopicIds(store.dailyTopics[e.target.value]?.topicIds ?? []); }} />
          </div>
          <TopicPicker topicGroups={topicGroups} selected={studyTopicIds} onChange={(id, checked) => toggleTopic(setStudyTopicIds, id, checked)} />
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <span className="text-sm">{todayStudyTopics.length} topic(s) already saved for {date}</span>
            <button disabled={!studyTopicIds.length} onClick={saveTopicsStudied} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Save studied topics</button>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border p-5">
          <div><h2 className="text-xl font-semibold">Record {tab === "dpp" ? "DPP" : tab === "mock" ? "unit mock" : "PYQ"}</h2><p className="text-sm opacity-65">{tab === "dpp" ? "One daily aggregate result: questions, correct, wrong and skipped." : tab === "mock" ? "Use this when a unit is completed." : "PYQ support is ready for later; you can leave it unused for now."}</p></div>
          {tab === "mock" && <input className="w-full rounded-lg border p-3" placeholder="Unit name, e.g. Algebra" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} />}
          {tab !== "dpp" && <input className="w-full rounded-lg border p-3" placeholder={tab === "mock" ? "Optional test title" : "PYQ paper title"} value={title} onChange={(e) => setTitle(e.target.value)} />}
          {tab === "pyq" && <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Year<input type="number" min="2000" className="mt-1 w-full rounded-lg border p-3" value={year} onChange={handleNumber(setYear)} /></label><label className="text-sm font-medium">Paper / session<input className="mt-1 w-full rounded-lg border p-3" placeholder="Optional" value={paper} onChange={(e) => setPaper(e.target.value)} /></label></div>}
          {tab !== "dpp" && <label className="block text-sm font-medium">Duration (minutes)<input type="number" min="0" className="mt-1 w-full rounded-lg border p-3" value={durationMinutes} onChange={handleNumber(setDurationMinutes)} /></label>}
          <div><p className="mb-2 font-medium">Topics covered in this {tab === "dpp" ? "DPP" : tab === "mock" ? "mock" : "paper"}</p><TopicPicker topicGroups={topicGroups} selected={topicIds} onChange={(id, checked) => toggleTopic(setTopicIds, id, checked)} /></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <NumberField label="Questions" value={questionCount} onChange={handleNumber(setQuestionCount)} />
            <NumberField label="Correct" value={correct} onChange={handleNumber(setCorrect)} />
            <NumberField label="Wrong" value={wrong} onChange={handleNumber(setWrong)} />
            <NumberField label="Skipped" value={skipped} onChange={handleNumber(setSkipped)} />
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900"><b>{correct + wrong}</b> attempted · <b>{accuracyOf(correct, wrong)}%</b> accuracy · {remaining === 0 ? "Totals match" : remaining > 0 ? `Need ${remaining} more result(s)` : `${Math.abs(remaining)} too many result(s)`}</div>
          <button disabled={!validResults || !topicIds.length || (tab === "mock" && !unitTitle.trim()) || (tab === "pyq" && !title.trim())} onClick={saveAssessment} className="w-full rounded-lg border px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Save {tab === "dpp" ? "DPP" : tab === "mock" ? "Mock" : "PYQ"}</button>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <RecordList title="Daily DPP history" empty="No DPP recorded yet." records={dppRecords.map((r) => ({ id: r.id, date: r.date, title: `${r.topicIds.length} topic(s)`, meta: `${r.questionCount} Q · ${r.correct} correct · ${r.wrong} wrong · ${r.skipped} skipped · ${accuracyOf(r.correct, r.wrong)}%`, onDelete: () => store.deleteDpp(r.id) }))} />
        <RecordList title="Unit mocks" empty="No unit mocks yet." records={mocks.map((r) => ({ id: r.id, date: r.date, title: r.unitTitle, meta: `${r.questionCount} Q · ${accuracyOf(r.correct, r.wrong)}%`, onDelete: () => store.deleteAssessment(r.id) }))} />
        <RecordList title="PYQs" empty="No PYQs recorded yet." records={pyqs.map((r) => ({ id: r.id, date: r.date, title: `${r.year} · ${r.title}`, meta: `${r.questionCount} Q · ${accuracyOf(r.correct, r.wrong)}%`, onDelete: () => store.deleteAssessment(r.id) }))} />
      </section>
    </main>
  );
}

function TabButton({ active, onClick, title, description }: { active: boolean; onClick: () => void; title: string; description: string }) {
  return <button onClick={onClick} className={`rounded-xl border p-4 text-left transition ${active ? "ring-2" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}><b>{title}</b><p className="mt-1 text-sm opacity-65">{description}</p></button>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <label className="text-sm font-medium">{label}<input type="number" min="0" className="mt-1 w-full rounded-lg border p-3" value={value} onChange={onChange} /></label>;
}

function TopicPicker({ topicGroups, selected, onChange }: { topicGroups: typeof NIMCET_SYLLABUS; selected: string[]; onChange: (id: string, checked: boolean) => void }) {
  return <div className="max-h-[430px] space-y-3 overflow-auto pr-1">{topicGroups.map((subject) => <details key={subject.id} open className="rounded-xl border p-3"><summary className="cursor-pointer font-semibold">{subject.title} <span className="text-xs font-normal opacity-60">({subject.questionCount} questions)</span></summary><div className="mt-3 space-y-2">{subject.topics.map((topic) => <label key={topic.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" className="mt-1 size-4" checked={selected.includes(topic.id)} onChange={(e) => onChange(topic.id, e.target.checked)} /><span><b>{topic.title}</b>{topic.details.length > 0 && <span className="block text-xs opacity-60">{topic.details.length} subtopic(s)</span>}</span></label>)}</div></details>)}</div>;
}

function RecordList({ title, empty, records }: { title: string; empty: string; records: { id: string; date: string; title: string; meta: string; onDelete: () => void }[] }) {
  return <section className="rounded-2xl border p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{records.length === 0 ? <p className="text-sm opacity-60">{empty}</p> : <div className="space-y-2">{records.slice(0, 10).map((r) => <div key={r.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><b>{r.title}</b><p className="text-xs opacity-60">{r.date} · {r.meta}</p></div><button onClick={r.onDelete} className="text-xs underline opacity-60">Delete</button></div></div>)}</div>}</section>;
}
