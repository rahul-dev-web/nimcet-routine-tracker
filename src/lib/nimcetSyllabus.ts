export type NimcetSubjectId = "mathematics" | "logical-reasoning" | "computer-awareness" | "general-english";

export interface NimcetTopic {
  id: string;
  title: string;
  details: string[];
}

export interface NimcetSubject {
  id: NimcetSubjectId;
  title: string;
  questionCount: number;
  topics: NimcetTopic[];
}

/**
 * NIMCET syllabus with effect from 2026.
 * Source: NIMCET Revised Syllabus provided with the project requirements.
 * Keep this data source-focused; preparation analytics should live separately.
 */
export const NIMCET_SYLLABUS: NimcetSubject[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    questionCount: 50,
    topics: [
      {
        id: "set-theory-and-logic",
        title: "Set Theory and Logic",
        details: [
          "Concepts of Sets",
          "Unions",
          "Intersection",
          "Difference",
          "Symmetric difference",
          "Cartesian Product",
          "Cardinality",
          "Functions and Relations",
          "Venn Diagrams",
          "Truth tables",
          "Connectives",
          "Tautology and Contradictions",
        ],
      },
      {
        id: "probability-and-statistics",
        title: "Probability and Statistics",
        details: [
          "Basic concepts of probability theory",
          "Averages",
          "Dependent and independent events",
          "Bayes' Theorem",
          "Mean",
          "Median",
          "Mode",
          "Mean deviation",
          "Standard deviation",
          "Variance",
          "Moments",
          "Frequency distributions",
        ],
      },
      {
        id: "algebra",
        title: "Algebra",
        details: [
          "Fundamental operations in algebra",
          "Quadratic equations with real coefficients",
          "Relation between roots & coefficients",
          "Symmetric functions of roots and their sums",
          "Indices",
          "Logarithms",
          "Exponentials",
          "Arithmetic progressions",
          "Geometric progressions",
          "Harmonic progressions",
          "Finite sums of powers of natural numbers",
          "Matrices & determinants",
          "Simultaneous linear equations",
          "Permutations & Combinations",
          "Binomial Theorem",
        ],
      },
      {
        id: "coordinate-geometry",
        title: "Coordinate Geometry",
        details: [
          "Rectangular Cartesian coordinates",
          "Distance formulae",
          "Equation of a line (various forms)",
          "Intersection of lines",
          "Pair of straight lines",
          "Equations of a circle",
          "Parabola",
          "Ellipse",
          "Hyperbola",
          "Section formula",
          "Tangents and normal to circles and conics",
        ],
      },
      {
        id: "calculus",
        title: "Calculus",
        details: [
          "Functions on real numbers",
          "Limits of functions",
          "Left and right limits",
          "Limits at infinity",
          "Continuous functions",
          "Applications of the intermediate value theorem",
          "Differentiation",
          "Applications of differentiation",
          "Tangents",
          "Normals",
          "Simple examples of maxima and minima",
          "Applications of Rolle's theorem",
          "Mean Value Theorem",
          "Integration of functions by parts",
          "Integration by substitution",
          "Integration by partial fraction",
          "Integration of odd & even functions",
          "Periodic functions",
          "Definite integrals",
          "Area computations",
        ],
      },
      {
        id: "trigonometry",
        title: "Trigonometry",
        details: [
          "Trigonometric functions",
          "Identities",
          "Principal value of inverse trigonometric functions",
          "Properties of triangles",
          "Solution of triangles",
          "Heights and distances",
          "Trigonometric equations",
          "General solutions of trigonometric equations",
        ],
      },
    ],
  },
  {
    id: "logical-reasoning",
    title: "Analytical Ability & Logical Reasoning",
    questionCount: 40,
    topics: [
      {
        id: "verbal-reasoning",
        title: "Verbal Reasoning",
        details: [],
      },
      {
        id: "non-verbal-reasoning",
        title: "Non-verbal Reasoning",
        details: [],
      },
      {
        id: "deductive-reasoning",
        title: "Deductive Reasoning",
        details: [],
      },
      {
        id: "inductive-reasoning",
        title: "Inductive Reasoning",
        details: [],
      },
      {
        id: "reasoning-topics",
        title: "Specified Reasoning Topics",
        details: [
          "Blood relations",
          "Coding-decoding",
          "Direction test",
          "Seating arrangement",
          "Puzzles",
          "Input-output",
          "Syllogism",
          "Alphanumeric series",
          "Mirror images",
          "Statements and conclusions/arguments",
        ],
      },
      {
        id: "analytical-skills",
        title: "Analytical and Data Skills",
        details: [
          "Problem solving",
          "Critical thinking",
          "Data Interpretation",
          "Numerical Reasoning",
          "Data Sufficiency",
          "Data Visualization",
        ],
      },
    ],
  },
  {
    id: "computer-awareness",
    title: "Computer Awareness",
    questionCount: 20,
    topics: [
      {
        id: "computer-basics",
        title: "Computer Basics",
        details: [
          "Organization of a computer",
          "Central Processing Unit (CPU)",
          "Structure of instructions in CPU",
          "Input/output devices",
          "Computer memory",
          "Back-up devices",
        ],
      },
      {
        id: "data-representation",
        title: "Data Representation",
        details: [
          "Representation of characters, integers, and fractions",
          "Binary representations",
          "Hexadecimal representations",
          "Binary arithmetic: addition, subtraction, multiplication, division",
          "Simple arithmetic",
          "Two's complement arithmetic",
          "Floating point representation of numbers",
          "Boolean algebra",
        ],
      },
      {
        id: "computer-hardware",
        title: "Computer Hardware",
        details: [
          "Input Devices: Keyboard, mouse, scanner, etc.",
          "Output Devices: Monitor, printer, speakers, etc.",
          "Storage Devices: Hard drives, SSDs, USB drives, etc.",
          "Memory: RAM, ROM, cache, etc.",
        ],
      },
      {
        id: "computer-software",
        title: "Computer Software",
        details: [
          "Operating Systems: Windows, macOS, Linux, Android, etc.",
          "System Software: Utility programs, device drivers",
          "Application Software: Basic concepts & tools",
        ],
      },
      {
        id: "internet-and-email",
        title: "Internet and Email",
        details: [
          "Web Browsing - Understanding how the internet works and how to navigate it",
          "Email - Sending, receiving, and managing emails",
          "Online Security - Basic awareness of online threats and safety measures",
        ],
      },
    ],
  },
  {
    id: "general-english",
    title: "General English",
    questionCount: 10,
    topics: [
      {
        id: "english-language-skills",
        title: "English Language Skills",
        details: [
          "Comprehension of written text",
          "Usage of words (vocabulary)",
          "Grasp of grammatical patterns",
          "Usage of sentence forms",
          "Sounds and word formation processes",
          "Meaning of words and phrases",
          "Technical writing",
          "Overall accuracy and fluency in expressions of English required for technical education",
        ],
      },
    ],
  },
];

export const NIMCET_TOTAL_QUESTIONS = NIMCET_SYLLABUS.reduce(
  (total, subject) => total + subject.questionCount,
  0,
);

export const NIMCET_SUBJECT_IDS: NimcetSubjectId[] = NIMCET_SYLLABUS.map(
  (subject) => subject.id,
);
