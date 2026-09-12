"use client";

import { useEffect, useMemo, useState } from "react";
import { accuracyOf, useNimcetStore, type AssessmentType } from "@/store/nimcetStore";
import { NIMCET_SYLLABUS } from "@/lib/nimcetSyllabus";

const today = () => new Date().toLocaleDateString("en-CA");

export default function NimcetPage() {
  const store = useNimcetStore();
  const [type, setType] = useState<AssessmentType>("dpp");
  const [date, setDate] = useState(today());
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [title, setTitle] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { store.load(); setLoaded(true); }, []);

  const allTopics = useMemo(() => NIMCET_SYLLABUS.flatMap((subject) => subject.topics.map((topic) => ({ ...topic, subjectName: subject.name }))), []);
  const attempted = correct + wrong;
  const validTotal = correct + wrong + skipped;

  const reset = () => { setQuestionCount(20); setCorrect(0); setWrong(0); setSkipped(0); setTitle(""); setTopicIds([]); };

  const submit = () => {
    if (!loaded || !topicIds.length || questionCount < 1 || validTotal !== questionCount) return;
    if (type === "dpp") {
      store.saveDpp({ id: "", date, topicIds, questionCount, correct, wrong, skipped, completed: true, recordedAt: "" });
    } else {
      store.saveAssessment({ id: "", type, date, title: title.trim() || `${type.toUpperCase()} — ${date}`, subjectIds: [], topicIds, questionCount, correct, wrong, skipped, score: correct, completed: true, recordedAt: "" });
    }
    reset();
  };

  const dppRecords = store.dpps;
  const otherRecords = store.assessments;

  return <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
    <header><p className="text-sm font-semibold uppercase tracking-wide opacity-60">NIMCET Preparation</p><h1 className="text-3xl font-bold">Practice & Tests</h1><p className="mt-2 opacity-70">Daily DPP is the regular practice layer. Mocks are for completed units. PYQs can be added later.</p></header>

    <section className="grid gap-3 md:grid-cols-3">
      {(["dpp", "mock", "pyq"] as AssessmentType[]).map((item) => <button key={item} onClick={() => setType(item)} className={`rounded-xl border p-4 text-left ${type === item ? "ring-2" : ""}`}><b>{item === "dpp" ? "Daily DPP" : item === "mock" ? "Unit Mock" : "PYQs"}</b><p className="mt-1 text-sm opacity-65">{item === "dpp" ? "Daily topic-wise practice" : item === "mock" ? "After completing a unit" : "Later phase"}</p></button>)}
    </section>

    <section className="rounded-2xl border p-5 space-y-4">
      <h2 className="text-xl font-semibold">Record {type === "dpp" ? "today’s DPP" : type === "mock" ? "a unit mock" : "PYQs"}</h2>
      {type !== "dpp" && <input className="w-full rounded-lg border p-3" placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} />}
      <input type="date" className="rounded-lg border p-3" value={date} onChange={(e) => setDate(e.target.value)} />
      <div><label className="mb-2 block font-medium">Topics covered</label><div className="grid max-h-56 gap-2 overflow-auto sm:grid-cols-2">{allTopics.map((topic) => <label key={topic.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={topicIds.includes(topic.id)} onChange={(e) => setTopicIds((v) => e.target.checked ? [...v, topic.id] : v.filter((id) => id !== topic.id))} />{topic.subjectName} — {topic.name}</label>)}</div></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["Questions", questionCount, setQuestionCount], ["Correct", correct, setCorrect], ["Wrong", wrong, setWrong], ["Skipped", skipped, setSkipped]].map(([label, value, setter]) => <label key={label as string} className="text-sm font-medium">{label}<input type="number" min="0" className="mt-1 w-full rounded-lg border p-3" value={value as number} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<number>>)(Number(e.target.value) || 0)} /></label>)}</div>
      <p className="text-sm opacity-70">Attempted: {attempted} · Accuracy: {accuracyOf(correct, wrong, skipped)}% · {validTotal === questionCount ? "Totals match" : `Need ${questionCount - validTotal} more question result(s)`}</p>
      <button disabled={!topicIds.length || validTotal !== questionCount} onClick={submit} className="rounded-lg border px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Save record</button>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      <RecordList title="Daily DPP history" records={dppRecords.map((r) => ({ id: r.id, date: r.date, title: r.topicIds.length + " topic(s)", count: r.questionCount, accuracy: accuracyOf(r.correct, r.wrong, r.skipped), onDelete: () => store.deleteDpp(r.id) }))} />
      <RecordList title="Mocks / PYQs history" records={otherRecords.map((r) => ({ id: r.id, date: r.date, title: r.title, count: r.questionCount, accuracy: accuracyOf(r.correct, r.wrong, r.skipped), onDelete: () => store.deleteAssessment(r.id) }))} />
    </section>
  </main>;
}

function RecordList({ title, records }: { title: string; records: { id: string; date: string; title: string; count: number; accuracy: number; onDelete: () => void }[] }) {
  return <section className="rounded-2xl border p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{records.length === 0 ? <p className="text-sm opacity-60">No records yet.</p> : <div className="space-y-2">{records.slice().reverse().map((r) => <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><b>{r.title}</b><p className="text-xs opacity-60">{r.date} · {r.count} questions · {r.accuracy}% accuracy</p></div><button onClick={r.onDelete} className="text-xs underline opacity-60">Delete</button></div>)}</div>}</section>;
}
