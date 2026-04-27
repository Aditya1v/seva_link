import { GoogleGenAI } from "@google/genai";

const CATEGORY_RULES = [
  {
    category: "Medical",
    severity: 24,
    keywords: [
      "medical",
      "medicine",
      "first aid",
      "doctor",
      "clinic",
      "injury",
      "injured",
      "insulin",
      "oxygen",
      "ambulance",
      "bandage",
      "pregnant",
      "fever",
      "chronic",
    ],
  },
  {
    category: "Food",
    severity: 18,
    keywords: ["food", "meal", "hungry", "ration", "pantry", "groceries", "baby formula", "water"],
  },
  {
    category: "Shelter",
    severity: 22,
    keywords: ["shelter", "housing", "homeless", "displaced", "evacuated", "fire", "flood", "blanket"],
  },
  {
    category: "Water & Sanitation",
    severity: 21,
    keywords: ["water", "sanitation", "toilet", "hygiene", "clean water", "contaminated", "sewage"],
  },
  {
    category: "Transport",
    severity: 12,
    keywords: ["transport", "delivery", "driver", "vehicle", "pickup", "drop", "logistics"],
  },
  {
    category: "Education",
    severity: 8,
    keywords: ["school", "education", "books", "students", "teacher", "stationery", "classroom"],
  },
  {
    category: "Clothing",
    severity: 10,
    keywords: ["clothing", "clothes", "winter", "coat", "shoes", "warm"],
  },
  {
    category: "Counseling",
    severity: 14,
    keywords: ["counseling", "mental", "trauma", "stress", "support group"],
  },
];

const URGENT_KEYWORDS = [
  "urgent",
  "emergency",
  "immediate",
  "critical",
  "tonight",
  "today",
  "asap",
  "life threatening",
  "no food",
  "no water",
  "trapped",
  "evacuate",
  "evacuation",
  "shortage",
  "running out",
];

const VULNERABLE_KEYWORDS = [
  "children",
  "infants",
  "baby",
  "babies",
  "elderly",
  "senior",
  "disabled",
  "pregnant",
  "single mother",
  "families",
  "homeless",
  "refugee",
  "chronic",
];

const TIME_KEYWORDS = ["now", "today", "tonight", "tomorrow", "24 hours", "48 hours", "before dark", "this morning"];

const SCARCITY_KEYWORDS = ["low", "empty", "running out", "shortage", "scarce", "no supply", "out of stock", "limited"];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "need",
  "needs",
  "needed",
  "please",
  "help",
  "have",
  "has",
  "are",
  "was",
  "were",
  "will",
  "can",
  "our",
  "their",
  "there",
  "than",
  "into",
  "about",
  "people",
  "families",
  "community",
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const countHits = (text, keywords) => keywords.filter((keyword) => text.includes(keyword)).length;

const tokenize = (text) =>
  (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

const titleCase = (value) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function inferCategory(text, requestedCategory) {
  if (requestedCategory && requestedCategory !== "Other") {
    return requestedCategory;
  }

  let best = { category: "Other", score: 0, severity: 8 };
  for (const rule of CATEGORY_RULES) {
    const hits = countHits(text, rule.keywords);
    const score = hits * 10 + (hits > 0 ? rule.severity : 0);
    if (score > best.score) {
      best = { category: rule.category, score, severity: rule.severity };
    }
  }
  return best.category;
}

function categorySeverity(category) {
  return CATEGORY_RULES.find((rule) => rule.category === category)?.severity || 8;
}

function affectedScore(affectedPeople = 0) {
  const people = Number(affectedPeople) || 0;
  if (people >= 250) return 20;
  if (people >= 100) return 16;
  if (people >= 50) return 12;
  if (people >= 10) return 8;
  if (people >= 1) return 4;
  return 0;
}

function inferTitle(rawText, category) {
  const clean = (rawText || "").replace(/\s+/g, " ").trim();
  if (!clean) return `${category} Support Request`;
  const firstSentence = clean.split(/[.!?]/)[0];
  const words = tokenize(firstSentence);
  if (words.length < 3) return `${category} Support Request`;
  return titleCase(words.join(" "));
}

function extractKeywords(rawText, category, location) {
  const tokens = tokenize(`${rawText} ${category || ""} ${location || ""}`);
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([token]) => token);
}

function urgencyFromScore(score) {
  if (score >= 78) return "critical";
  if (score >= 58) return "high";
  if (score >= 34) return "medium";
  return "low";
}

function summarize(rawText, category, location, affectedPeople) {
  const text = (rawText || "").replace(/\s+/g, " ").trim();
  const base = text.length > 180 ? `${text.slice(0, 177)}...` : text;
  const suffix = [
    affectedPeople ? `${affectedPeople} people affected` : "",
    location ? `Location: ${location}` : "",
    category ? `Category: ${category}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  return suffix ? `${base} (${suffix})` : base;
}

export function prioritizeNeedFallback(input = {}) {
  const rawText = String(input.rawText || input.description || "").trim();
  const lowerText = `${rawText} ${input.location || ""} ${input.category || ""}`.toLowerCase();
  const category = inferCategory(lowerText, input.category);
  const urgentHits = countHits(lowerText, URGENT_KEYWORDS);
  const vulnerableHits = countHits(lowerText, VULNERABLE_KEYWORDS);
  const timeHits = countHits(lowerText, TIME_KEYWORDS);
  const scarcityHits = countHits(lowerText, SCARCITY_KEYWORDS);
  const score =
    10 +
    categorySeverity(category) +
    urgentHits * 12 +
    vulnerableHits * 7 +
    timeHits * 6 +
    scarcityHits * 6 +
    affectedScore(input.affectedPeople);
  const priorityScore = clamp(Math.round(score), 1, 100);

  const reasons = [
    `${category} category severity`,
    urgentHits ? `${urgentHits} urgency clue${urgentHits > 1 ? "s" : ""}` : "",
    vulnerableHits ? `${vulnerableHits} vulnerable group clue${vulnerableHits > 1 ? "s" : ""}` : "",
    timeHits ? "time-sensitive wording" : "",
    scarcityHits ? "resource scarcity wording" : "",
    input.affectedPeople ? `${input.affectedPeople} people affected` : "",
  ].filter(Boolean);

  return {
    title: inferTitle(rawText, category),
    category,
    urgency: urgencyFromScore(priorityScore),
    priorityScore,
    summary: summarize(rawText, category, input.location, input.affectedPeople),
    reason: `Heuristic priority: ${reasons.join(", ")}.`,
    keywords: extractKeywords(rawText, category, input.location),
    aiSource: "fallback",
  };
}

function normalizeNeedResult(candidate, fallback) {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }
  const priorityScore = clamp(Number(candidate.priorityScore) || fallback.priorityScore, 1, 100);
  const urgency = ["critical", "high", "medium", "low"].includes(candidate.urgency)
    ? candidate.urgency
    : urgencyFromScore(priorityScore);

  return {
    title: String(candidate.title || fallback.title).slice(0, 96),
    category: String(candidate.category || fallback.category).slice(0, 40),
    urgency,
    priorityScore,
    summary: String(candidate.summary || fallback.summary).slice(0, 360),
    reason: String(candidate.reason || fallback.reason).slice(0, 520),
    keywords: Array.isArray(candidate.keywords) && candidate.keywords.length
      ? candidate.keywords.map((keyword) => String(keyword).toLowerCase()).slice(0, 10)
      : fallback.keywords,
    aiSource: candidate.aiSource || "llm",
  };
}

async function tryLlmPrioritization(input, fallback) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 8000);
  const request = ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You structure community relief requests for an NGO dispatch dashboard.",
              "Return only valid JSON with these keys: title, category, urgency, priorityScore, summary, reason, keywords.",
              "urgency must be one of: critical, high, medium, low.",
              "priorityScore must be a number from 1 to 100.",
              "keywords must be an array of short lowercase strings.",
              `Request payload: ${JSON.stringify({
                rawText: input.rawText,
                location: input.location,
                category: input.category,
                reporter: input.reporter,
                affectedPeople: input.affectedPeople,
                fallback,
              })}`,
            ].join(" "),
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });
  const response = await Promise.race([
    request,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);

  const parsed = JSON.parse(response.text || "{}");
  return normalizeNeedResult({ ...parsed, aiSource: "llm" }, fallback);
}

export async function prioritizeNeed(input = {}) {
  const fallback = prioritizeNeedFallback(input);
  try {
    const llmResult = await tryLlmPrioritization(input, fallback);
    return llmResult || fallback;
  } catch (error) {
    return {
      ...fallback,
      aiWarning: `LLM unavailable, deterministic fallback used: ${error.message}`,
    };
  }
}

function districtNumber(location = "") {
  const match = String(location).match(/district\s*(\d+)/i);
  return match ? match[1] : null;
}

function normalizeTerms(values = []) {
  return new Set(
    values
      .flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/))
      .filter((value) => value.length > 2 && !STOPWORDS.has(value)),
  );
}

function overlapScore(needTerms, volunteerTerms) {
  if (!needTerms.size || !volunteerTerms.size) return 0;
  let hits = 0;
  for (const term of needTerms) {
    if (volunteerTerms.has(term)) hits += 1;
  }
  return hits / needTerms.size;
}

function availabilityScore(volunteer) {
  if (volunteer.availability === "available") return 1;
  if (volunteer.availability === "limited") return 0.6;
  return 0.15;
}

function workloadScore(volunteer) {
  const capacity = Math.max(Number(volunteer.capacity) || 1, 1);
  const workload = Math.max(Number(volunteer.workload) || 0, 0);
  return clamp(1 - workload / (capacity + 1), 0.1, 1);
}

function categoryFit(need, volunteer) {
  const categories = normalizeTerms(volunteer.categories || []);
  if (!need.category) return 0.4;
  return categories.has(String(need.category).toLowerCase()) ? 1 : 0.35;
}

function locationScore(need, volunteer) {
  const needDistrict = districtNumber(need.location);
  const volunteerDistrict = districtNumber(volunteer.location);
  if (needDistrict && volunteerDistrict && needDistrict === volunteerDistrict) return 1;
  if (need.location && volunteer.location && String(need.location).toLowerCase() === String(volunteer.location).toLowerCase()) return 1;
  if (!need.location || !volunteer.location) return 0.45;
  return 0.35;
}

function pastRelevance(need, volunteer) {
  const past = normalizeTerms(volunteer.pastAssignments || []);
  if (!need.category) return 0.2;
  return past.has(String(need.category).toLowerCase()) ? 1 : 0.25;
}

export function rankVolunteersForNeed(need = {}, volunteers = []) {
  const needTerms = normalizeTerms([need.category, need.title, need.summary, ...(need.keywords || [])]);

  const matches = volunteers
    .map((volunteer) => {
      const volunteerTerms = normalizeTerms([
        ...(volunteer.skills || []),
        ...(volunteer.categories || []),
        ...(volunteer.pastAssignments || []),
      ]);
      const skillOverlap = overlapScore(needTerms, volunteerTerms);
      const location = locationScore(need, volunteer);
      const availability = availabilityScore(volunteer);
      const workload = workloadScore(volunteer);
      const category = categoryFit(need, volunteer);
      const history = pastRelevance(need, volunteer);
      const score = Math.round(
        clamp(
          skillOverlap * 34 +
            category * 18 +
            location * 16 +
            availability * 16 +
            workload * 10 +
            history * 6,
          1,
          100,
        ),
      );
      const reasons = [
        skillOverlap >= 0.45 ? "strong skill and keyword overlap" : skillOverlap >= 0.2 ? "some skill overlap" : "limited direct skill overlap",
        location >= 1 ? "same district" : location >= 0.45 ? "location usable" : "farther location",
        availability >= 1 ? "available now" : availability >= 0.6 ? "limited availability" : "currently busy",
        workload >= 0.75 ? "light workload" : "workload considered",
        history >= 1 ? "past work in this category" : "",
      ].filter(Boolean);

      return {
        volunteerId: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        score,
        reason: reasons.join(", "),
        skills: volunteer.skills || [],
        location: volunteer.location,
        availability: volunteer.availability,
        workload: volunteer.workload || 0,
        rating: volunteer.rating || 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .slice(0, 8);

  return {
    needId: need.id,
    matches,
  };
}
