// Practice cards used only when Gemini can't be reached (no API key,
// network down, quota hit). Same shape and style as Gemini's questions.

import type { FeedQuestion, FeedSet } from './types';

const BACKUP_QUESTIONS: Omit<FeedQuestion, 'id'>[] = [
  {
    topicId: 5,
    topic: 'Hallucinations',
    tag: 'CATCH THE BOT',
    why: 'AI can make up facts and still sound sure. This card helps you catch it.',
    intro: 'A student asked me for help with a book report. Look at what I said. Did I mess up?',
    artifactKind: 'chat',
    artifactLines: [
      { label: 'Student', text: 'Who wrote the book "The Lost Lighthouse"?' },
      { label: 'AI', text: 'Maria Lopez wrote it in 1998, and she won three Olympic gold medals in swimming!' }
    ],
    question: 'What should the student do with that answer?',
    options: [
      'Trust all of it, because computers can’t lie.',
      'Use it, since the AI sounded really sure.',
      'Check the surprising part in a trusted source first.',
      'Copy it, because the first half sounded right.'
    ],
    correctIndex: 2,
    explanation: 'AI can mix a made-up fact in with real ones. That’s called a hallucination. When something sounds surprising, check it in a book or a trusted website.',
    pipRight: 'You caught me! I made that part up.',
    pipWrong: 'Careful! I sounded sure, but I made that up.'
  },
  {
    topicId: 4,
    topic: 'Sharing & Privacy (PII)',
    tag: 'STAY PRIVATE',
    why: 'Everyone gets privacy cards, because keeping your info safe matters every day.',
    intro: 'Four students typed these into a public chatbot. Only one is safe to send.',
    artifactKind: 'prompts',
    artifactLines: [
      { label: 'Prompt 1', text: 'My name is Jamie Rivera and I live at 12 Oak Street.' },
      { label: 'Prompt 2', text: 'Here is my school login password: tiger123.' },
      { label: 'Prompt 3', text: 'Can you explain how volcanoes erupt?' },
      { label: 'Prompt 4', text: 'Text the answer to my phone, 555-0142.' }
    ],
    question: 'Which prompt is safe to send?',
    options: [
      'Prompt 1, because it’s just my name and street.',
      'Prompt 2, because the AI won’t tell anyone.',
      'Prompt 4, because phone numbers aren’t private.',
      'Prompt 3, because it only asks about volcanoes.'
    ],
    correctIndex: 3,
    explanation: 'Your full name, address, phone number and passwords are PII, private info that points to you. Ask about the topic and leave your personal details out.',
    pipRight: 'Yes! Ask me anything, just keep your private info private.',
    pipWrong: 'Oops! That one shares private info about you.'
  },
  {
    topicId: 6,
    topic: 'Voice Cloning',
    tag: 'IS IT REALLY THEM?',
    why: 'AI can copy voices now. This card teaches you how to check who is really calling.',
    intro: 'Your phone rings. The caller sounds exactly like your older brother.',
    artifactKind: 'chat',
    artifactLines: [
      { label: 'Caller', text: 'It’s me! I lost my phone. Send me Mom’s credit card number right now!' }
    ],
    question: 'What’s the smartest thing to do?',
    options: [
      'Hang up and call him back on his real number.',
      'Send it fast, because it sounds just like him.',
      'Send half the number to be safe.',
      'Keep chatting so he doesn’t feel ignored.'
    ],
    correctIndex: 0,
    explanation: 'AI can copy someone’s voice from a short clip. Hang up and call them back on their real number, or ask for your family’s safe word.',
    pipRight: 'Smart! A voice alone doesn’t prove who it is.',
    pipWrong: 'Hmm, AI can fake that voice. Always double-check!'
  },
  {
    topicId: 7,
    topic: 'Scam Identification (AI Phishing)',
    tag: 'SCAM SPOTTER',
    why: 'Scam messages written by AI can look perfect. This card shows the clues that give them away.',
    intro: 'This email has perfect spelling and grammar. Is it safe to click?',
    artifactKind: 'email',
    artifactLines: [
      { label: 'From', text: 'prizes@g00gle-winners.example' },
      { label: 'Subject', text: 'URGENT: You won! Claim in 10 minutes' },
      { label: 'Message', text: 'Click the link and type your password to get your prize.' }
    ],
    question: 'What gives this email away as a scam?',
    options: [
      'Nothing. Perfect spelling means it’s real.',
      'Scams always have typos, so this one is fine.',
      'It has a subject line, and scams never do.',
      'The weird sender, the rush and the password request.'
    ],
    correctIndex: 3,
    explanation: 'AI can write scam emails with perfect grammar. Check the sender’s address, slow down when a message rushes you, and never type your password from an email link.',
    pipRight: 'Great eye! Those three clues scream scam.',
    pipWrong: 'Not quite! Good spelling doesn’t make it safe.'
  }
];

export function makeBackupSet(): FeedSet {
  const questions = BACKUP_QUESTIONS.map((q) => ({ ...q, id: crypto.randomUUID() }));
  return {
    id: crypto.randomUUID(),
    source: 'backup',
    createdAt: new Date().toISOString(),
    questions,
    answers: questions.map(() => null)
  };
}
