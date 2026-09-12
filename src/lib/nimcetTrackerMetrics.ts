export interface AssessmentSummary { questionCount: number; correct: number; wrong: number; skipped: number; }

export function accuracyOf(correct: number, wrong: number): number {
  const attempted = correct + wrong;
  return attempted === 0 ? 0 : Math.round((correct / attempted) * 1000) / 10;
}

export function validateQuestionTotals(record: AssessmentSummary): boolean {
  return record.questionCount >= 0 && record.correct >= 0 && record.wrong >= 0 && record.skipped >= 0 && record.correct + record.wrong + record.skipped === record.questionCount;
}
