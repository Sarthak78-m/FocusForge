/**
 * intentService.ts
 *
 * Natural-language intent recognition engine.
 *
 * Architecture:
 *   - Each IntentDefinition owns a set of pattern groups.
 *   - A pattern group is an array of tokens, ALL of which must appear in the
 *     message for that group to match (AND logic within a group).
 *   - Multiple pattern groups per intent are OR'd together.
 *   - The overall intent score is (matched_tokens / pattern_tokens).
 *   - The highest-scoring intent above CONFIDENCE_THRESHOLD wins.
 *
 * Entity extraction:
 *   - After recognising the intent, named entities (task title, subject, date)
 *     are stripped out of the message and returned alongside the intent.
 */

// ─── Intent Type Catalogue ────────────────────────────────────────────────────

export type IntentType =
  | 'TODAY_TASKS'
  | 'TOMORROW_TASKS'
  | 'PENDING_GOALS'
  | 'COMPLETED_GOALS'
  | 'SHOW_ANALYTICS'
  | 'START_POMODORO'
  | 'STOP_POMODORO'
  | 'RESUME_TIMER'
  | 'COMPLETE_TASK'
  | 'DELETE_TASK'
  | 'MOVE_TASK'
  | 'GENERATE_QUIZ'
  | 'OPEN_NOTES'
  | 'WEAK_SUBJECTS'
  | 'STRONG_SUBJECTS'
  | 'STUDY_STREAK'
  | 'UPCOMING_EXAM'
  | 'RECOMMENDED_STUDY_ORDER'
  | 'ESTIMATE_COMPLETION'
  | 'UNKNOWN';

// ─── Recognised Intent ────────────────────────────────────────────────────────

export type RecognisedIntent = {
  type: IntentType;
  confidence: number;       // 0.0 – 1.0
  rawInput: string;
  entities: IntentEntities;
};

export type IntentEntities = {
  /** Extracted task title (for complete/delete/move) */
  taskTitle?: string;
  /** Subject name (for quiz/weak/strong) */
  subject?: string;
  /** Date string (for tomorrow, exam queries) */
  date?: string;
  /** Raw remainder after stripping command keywords */
  remainder?: string;
};

// ─── Pattern Definition ───────────────────────────────────────────────────────

type IntentDefinition = {
  type: IntentType;
  /**
   * Array of token-groups. Each group is an AND clause.
   * Groups are OR'd together to produce the final score.
   * Tokens are lowercased substrings to match against the normalised message.
   */
  patterns: string[][];
  /** Minimum confidence to fire this intent (0–1). Default 0.55. */
  minConfidence?: number;
};

// ─── Intent Definitions ───────────────────────────────────────────────────────

const INTENT_DEFINITIONS: IntentDefinition[] = [
  // ── Tasks ──────────────────────────────────────────────────────────────────
  {
    type: 'TODAY_TASKS',
    patterns: [
      ['today', 'task'],
      ['today', 'tasks'],
      ["what's left", 'today'],
      ['what is left', 'today'],
      ['left today'],
      ['due today'],
      ['tasks today'],
      ['show today'],
      ['this day', 'task'],
    ],
  },
  {
    type: 'TOMORROW_TASKS',
    patterns: [
      ['tomorrow', 'task'],
      ['tomorrow', 'tasks'],
      ['due tomorrow'],
      ['tasks tomorrow'],
      ['next day', 'task'],
    ],
  },
  {
    type: 'COMPLETE_TASK',
    patterns: [
      ['complete', 'task'],
      ['mark', 'done'],
      ['mark', 'complete'],
      ['finish', 'task'],
      ['done with'],
      ['completed task'],
      ['tick off'],
      ['check off'],
    ],
    minConfidence: 0.45,
  },
  {
    type: 'DELETE_TASK',
    patterns: [
      ['delete', 'task'],
      ['remove', 'task'],
      ['cancel', 'task'],
      ['drop', 'task'],
    ],
    minConfidence: 0.5,
  },
  {
    type: 'MOVE_TASK',
    patterns: [
      ['move', 'task'],
      ['reschedule', 'task'],
      ['change', 'due date'],
      ['update', 'due date'],
      ['postpone', 'task'],
      ['push', 'task'],
    ],
    minConfidence: 0.45,
  },

  // ── Goals ──────────────────────────────────────────────────────────────────
  {
    type: 'PENDING_GOALS',
    patterns: [
      ['pending', 'goal'],
      ['active', 'goal'],
      ['my goals'],
      ['show goals'],
      ['goals'],
      ['what are my goals'],
      ['current goals'],
      ['ongoing goals'],
    ],
  },
  {
    type: 'COMPLETED_GOALS',
    patterns: [
      ['completed', 'goal'],
      ['done', 'goal'],
      ['finished', 'goal'],
      ['achieved', 'goal'],
      ['goals done'],
      ['goals completed'],
    ],
  },

  // ── Pomodoro ───────────────────────────────────────────────────────────────
  {
    type: 'START_POMODORO',
    patterns: [
      ['start', 'pomodoro'],
      ['begin', 'pomodoro'],
      ['start', 'timer'],
      ['begin', 'timer'],
      ['start', 'focus'],
      ['focus session'],
      ['start session'],
      ['begin focus'],
      ['pomodoro start'],
    ],
  },
  {
    type: 'STOP_POMODORO',
    patterns: [
      ['stop', 'pomodoro'],
      ['pause', 'pomodoro'],
      ['stop', 'timer'],
      ['pause', 'timer'],
      ['end', 'pomodoro'],
      ['cancel', 'timer'],
      ['halt', 'timer'],
    ],
  },
  {
    type: 'RESUME_TIMER',
    patterns: [
      ['resume', 'timer'],
      ['resume', 'pomodoro'],
      ['continue', 'timer'],
      ['continue', 'pomodoro'],
      ['unpause'],
      ['restart', 'timer'],
    ],
  },

  // ── Analytics ──────────────────────────────────────────────────────────────
  {
    type: 'SHOW_ANALYTICS',
    patterns: [
      ['show', 'analytics'],
      ['analytics'],
      ['my stats'],
      ['statistics'],
      ['my progress'],
      ['how am i doing'],
      ['performance'],
      ['study stats'],
      ['productivity'],
      ['show stats'],
    ],
  },

  // ── Quiz ───────────────────────────────────────────────────────────────────
  {
    type: 'GENERATE_QUIZ',
    patterns: [
      ['generate', 'quiz'],
      ['create', 'quiz'],
      ['quiz me'],
      ['test me'],
      ['take a quiz'],
      ['give me a quiz'],
      ['quiz on'],
      ['make a quiz'],
      ['practice quiz'],
      ['start quiz'],
    ],
    minConfidence: 0.45,
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  {
    type: 'OPEN_NOTES',
    patterns: [
      ['open', 'notes'],
      ['show', 'notes'],
      ['my notes'],
      ['view notes'],
      ['notes'],
      ['go to notes'],
    ],
  },

  // ── Subjects ───────────────────────────────────────────────────────────────
  {
    type: 'WEAK_SUBJECTS',
    patterns: [
      ['weak', 'subject'],
      ['weak subjects'],
      ['what am i bad at'],
      ['struggling with'],
      ['need improvement'],
      ['low score subject'],
      ['weakest subject'],
      ['bad subject'],
      ['poor performance'],
    ],
  },
  {
    type: 'STRONG_SUBJECTS',
    patterns: [
      ['strong', 'subject'],
      ['strong subjects'],
      ['what am i good at'],
      ['best subject'],
      ['top subject'],
      ['excellent at'],
      ['high score subject'],
      ['strongest subject'],
    ],
  },

  // ── Streak ─────────────────────────────────────────────────────────────────
  {
    type: 'STUDY_STREAK',
    patterns: [
      ['study streak'],
      ['streak'],
      ['my streak'],
      ['day streak'],
      ['consecutive days'],
      ['how many days'],
      ['daily streak'],
    ],
  },

  // ── Exams / Deadlines ──────────────────────────────────────────────────────
  {
    type: 'UPCOMING_EXAM',
    patterns: [
      ['upcoming exam'],
      ['next exam'],
      ['exam deadline'],
      ['exam date'],
      ['upcoming deadline'],
      ['deadlines'],
      ['when is my exam'],
      ['upcoming test'],
      ['schedule exam'],
      ['exam schedule'],
    ],
  },
  {
    type: 'RECOMMENDED_STUDY_ORDER',
    patterns: [
      ['what', 'study', 'today'],
      ['recommend', 'study', 'order'],
      ['study', 'plan', 'today'],
      ['recommendation', 'study'],
      ['how', 'should', 'study', 'today'],
      ['what should i study'],
      ['study', 'priority', 'today'],
      ['suggest', 'what', 'study'],
      ['study today'],
    ],
  },
  {
    type: 'ESTIMATE_COMPLETION',
    patterns: [
      ['finish', 'today', 'work'],
      ['can i finish'],
      ['finish', 'today', 'tasks'],
      ['estimate', 'completion'],
      ['completion', 'time'],
      ['time', 'finish', 'tasks'],
      ['how long', 'tasks', 'take'],
      ['study speed'],
    ],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MIN_CONFIDENCE = 0.52;

// ─── Scoring ──────────────────────────────────────────────────────────────────

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePattern(normalised: string, pattern: string[]): number {
  const hit = pattern.filter((token) => normalised.includes(token)).length;
  return hit / pattern.length;
}

function scoreIntent(normalised: string, def: IntentDefinition): number {
  // Take the maximum score across all pattern groups (OR logic)
  return Math.max(...def.patterns.map((p) => scorePattern(normalised, p)));
}

// ─── Entity Extraction ────────────────────────────────────────────────────────

/** Keywords to strip when extracting entity remainder */
const COMMAND_KEYWORDS = [
  'complete', 'finish', 'mark', 'done', 'delete', 'remove', 'cancel', 'drop',
  'move', 'reschedule', 'postpone', 'push', 'task', 'quiz', 'generate', 'create',
  'a', 'an', 'the', 'my', 'for', 'on', 'with', 'to', 'about', 'me',
];

function extractRemainder(normalised: string, intentType: IntentType): string {
  let text = normalised;
  // Remove the command-specific keywords to leave the entity
  COMMAND_KEYWORDS.forEach((kw) => {
    text = text.replace(new RegExp(`\\b${kw}\\b`, 'g'), '').trim();
  });
  return text.replace(/\s+/g, ' ').trim();
}

function extractEntities(raw: string, type: IntentType): IntentEntities {
  const normalised = normalise(raw);
  const entities: IntentEntities = {};

  switch (type) {
    case 'COMPLETE_TASK':
    case 'DELETE_TASK':
    case 'MOVE_TASK': {
      const remainder = extractRemainder(normalised, type);
      if (remainder) {
        entities.taskTitle = remainder;
        entities.remainder = remainder;
      }
      break;
    }
    case 'GENERATE_QUIZ': {
      // Extract subject after "quiz on X" or "quiz me on X"
      const quizOnMatch = normalised.match(/quiz(?:\s+me)?\s+(?:on|about)\s+(.+)/);
      if (quizOnMatch) {
        entities.subject = quizOnMatch[1].trim();
      } else {
        const remainder = extractRemainder(normalised, type);
        if (remainder) entities.subject = remainder;
      }
      break;
    }
    case 'UPCOMING_EXAM': {
      // Try to find a subject / exam name
      const remainder = extractRemainder(normalised, type);
      if (remainder) entities.subject = remainder;
      break;
    }
    case 'TOMORROW_TASKS': {
      entities.date = getTomorrowISO();
      break;
    }
    case 'TODAY_TASKS': {
      entities.date = getTodayISO();
      break;
    }
  }

  return entities;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Recognise the intent of a user message.
 *
 * @param input  Raw user message string
 * @returns      RecognisedIntent with type, confidence, and extracted entities
 */
export function recognize(input: string): RecognisedIntent {
  const normalised = normalise(input);

  let bestType: IntentType = 'UNKNOWN';
  let bestScore = 0;
  let bestDef: IntentDefinition | undefined;

  for (const def of INTENT_DEFINITIONS) {
    const score = scoreIntent(normalised, def);
    if (score > bestScore) {
      bestScore = score;
      bestType = def.type;
      bestDef = def;
    }
  }

  const minConf = bestDef?.minConfidence ?? DEFAULT_MIN_CONFIDENCE;

  if (bestScore < minConf) {
    return {
      type: 'UNKNOWN',
      confidence: bestScore,
      rawInput: input,
      entities: {},
    };
  }

  return {
    type: bestType,
    confidence: bestScore,
    rawInput: input,
    entities: extractEntities(input, bestType),
  };
}

/**
 * Expose the raw intent definitions for debugging / testing.
 */
export const intentDefinitions = INTENT_DEFINITIONS;
