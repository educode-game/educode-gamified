export const langToJudge0 = {
  cpp: 49,      // GCC 12
  java: 62,     // Java 17
  python: 71,   // Python 3.10
} as const;

export type EduCodeWorld = keyof typeof langToJudge0;
