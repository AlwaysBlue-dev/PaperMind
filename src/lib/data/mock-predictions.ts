import type {
  ChapterFrequency,
  Prediction,
  PredictionsResponse,
  YearRange,
} from "@/lib/types/predict";

const CHAPTERS = [
  { number: 1, name: "Physical Quantities & Measurement" },
  { number: 2, name: "Kinematics" },
  { number: 3, name: "Dynamics" },
  { number: 4, name: "Turning Effect of Forces" },
  { number: 5, name: "Electrostatics" },
  { number: 6, name: "Current Electricity" },
  { number: 7, name: "Electromagnetism" },
  { number: 8, name: "Electromagnetic Induction" },
  { number: 9, name: "Electronics" },
  { number: 10, name: "Information & Communication Technology" },
  { number: 11, name: "Atomic & Nuclear Physics" },
];

const QUESTIONS: Omit<Prediction, "id">[] = [
  {
    questionText:
      "State Coulomb's law and derive the expression for electric field intensity due to a point charge.",
    chapterName: "Electrostatics",
    chapterNumber: 5,
    questionType: "long",
    probabilityScore: 87,
    frequencyCount: 8,
    totalYears: 10,
    yearsAppeared: [2015, 2016, 2018, 2019, 2020, 2021, 2022, 2024],
    lastAppearedYear: 2024,
    trend: "up",
    isSyllabusFlagged: true,
  },
  {
    questionText:
      "Calculate the current flowing through a 12Ω resistor when connected to a 6V battery.",
    chapterName: "Current Electricity",
    chapterNumber: 6,
    questionType: "short",
    probabilityScore: 79,
    frequencyCount: 7,
    totalYears: 10,
    yearsAppeared: [2016, 2017, 2019, 2020, 2021, 2023, 2024],
    lastAppearedYear: 2024,
    trend: "up",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "Which of the following is the SI unit of electric charge? (A) Ampere (B) Coulomb (C) Volt (D) Ohm",
    chapterName: "Electrostatics",
    chapterNumber: 5,
    questionType: "mcq",
    probabilityScore: 72,
    frequencyCount: 6,
    totalYears: 10,
    yearsAppeared: [2015, 2017, 2018, 2020, 2022, 2024],
    lastAppearedYear: 2024,
    trend: "flat",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "Explain Faraday's law of electromagnetic induction with a suitable diagram.",
    chapterName: "Electromagnetic Induction",
    chapterNumber: 8,
    questionType: "long",
    probabilityScore: 68,
    frequencyCount: 5,
    totalYears: 10,
    yearsAppeared: [2016, 2018, 2020, 2022, 2023],
    lastAppearedYear: 2023,
    trend: "down",
    isSyllabusFlagged: true,
  },
  {
    questionText:
      "Define terminal velocity and derive the formula for a body falling through a viscous medium.",
    chapterName: "Dynamics",
    chapterNumber: 3,
    questionType: "long",
    probabilityScore: 64,
    frequencyCount: 5,
    totalYears: 10,
    yearsAppeared: [2015, 2017, 2019, 2021, 2023],
    lastAppearedYear: 2023,
    trend: "flat",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "What is the difference between n-type and p-type semiconductors?",
    chapterName: "Electronics",
    chapterNumber: 9,
    questionType: "short",
    probabilityScore: 58,
    frequencyCount: 4,
    totalYears: 10,
    yearsAppeared: [2017, 2019, 2021, 2024],
    lastAppearedYear: 2024,
    trend: "up",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "A car accelerates uniformly from rest to 20 m/s in 5 seconds. Find the acceleration.",
    chapterName: "Kinematics",
    chapterNumber: 2,
    questionType: "short",
    probabilityScore: 55,
    frequencyCount: 4,
    totalYears: 10,
    yearsAppeared: [2016, 2018, 2020, 2022],
    lastAppearedYear: 2022,
    trend: "down",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "Describe the working principle of a cathode ray oscilloscope (CRO).",
    chapterName: "Electronics",
    chapterNumber: 9,
    questionType: "long",
    probabilityScore: 48,
    frequencyCount: 3,
    totalYears: 10,
    yearsAppeared: [2015, 2018, 2021],
    lastAppearedYear: 2021,
    trend: "down",
    isSyllabusFlagged: false,
  },
  {
    questionText:
      "Define half-life of a radioactive substance and solve: If N₀ = 800, find N after 2 half-lives.",
    chapterName: "Atomic & Nuclear Physics",
    chapterNumber: 11,
    questionType: "short",
    probabilityScore: 76,
    frequencyCount: 6,
    totalYears: 10,
    yearsAppeared: [2016, 2017, 2019, 2021, 2023, 2024],
    lastAppearedYear: 2024,
    trend: "up",
    isSyllabusFlagged: true,
  },
  {
    questionText:
      "Which law relates the magnetic force on a current-carrying conductor? (A) Faraday (B) Fleming (C) Ampere (D) Lenz",
    chapterName: "Electromagnetism",
    chapterNumber: 7,
    questionType: "mcq",
    probabilityScore: 42,
    frequencyCount: 2,
    totalYears: 10,
    yearsAppeared: [2017, 2020],
    lastAppearedYear: 2020,
    trend: "flat",
    isSyllabusFlagged: false,
  },
];

function buildChapterHeatmap(yearRange: YearRange): ChapterFrequency[] {
  return CHAPTERS.map((ch, i) => {
    const yearsAppeared = 3 + (i % 5);
    const windowYears = yearRange;
    return {
      chapterNumber: ch.number,
      chapterName: ch.name,
      yearsAppeared: Math.min(yearsAppeared, windowYears),
      windowYears,
      rate: Math.round((Math.min(yearsAppeared, windowYears) / windowYears) * 100),
    };
  }).slice(0, yearRange === 5 ? 8 : yearRange === 10 ? 10 : 11);
}

export function generateMockPredictions(yearRange: YearRange): PredictionsResponse {
  const predictions: Prediction[] = QUESTIONS.map((q, i) => ({
    ...q,
    id: `pred-${i + 1}`,
    totalYears: yearRange,
    frequencyCount: Math.min(q.frequencyCount, yearRange),
  }));

  return {
    predictions,
    meta: {
      papersAnalysed: yearRange * 3 + 12,
      questionsFound: 180 + yearRange * 24,
      yearsCovered: yearRange,
      chapters: buildChapterHeatmap(yearRange),
    },
  };
}
