// ============================================================================
// GEMINI GOES HERE
// ----------------------------------------------------------------------------
// Nothing in this file calls an AI yet. When you add Gemini:
//   1. npm i @google/genai --prefix backend
//   2. Put GEMINI_API_KEY=... in backend/.env (see backend/.env.example).
//      The key stays on the server; the browser only talks to /api/*.
//   3. Implement the functions below, then switch the grader in
//      server/src/grading/index.ts from mockGrade to these.
//
// Ideas for each battle mode:
//   - Picture Twin: generate an image from the kid's prompt, then ask Gemini
//     to judge it against the 5 checklist elements (20 pts each).
//   - Literal Robot: ask Gemini to act out the kid's steps hyper-literally and
//     report which required steps were missing.
//   - Secret Word Taboo: send the kid's prompt as-is and check whether the
//     reply contains the secret word.
// ============================================================================

export function geminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || undefined;
}

export function isGeminiConfigured(): boolean {
  return Boolean(geminiApiKey());
}
