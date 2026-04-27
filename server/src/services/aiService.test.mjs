import test from "node:test";
import assert from "node:assert/strict";
import { prioritizeNeedFallback, rankVolunteersForNeed } from "./aiService.mjs";

test("prioritizeNeedFallback scores urgent vulnerable medical needs highly", () => {
  const result = prioritizeNeedFallback({
    rawText: "Urgent medical support needed today for children and elderly residents. Insulin is running out.",
    location: "District 5",
    affectedPeople: 60,
  });

  assert.equal(result.category, "Medical");
  assert.ok(result.priorityScore >= 75);
  assert.match(result.reason, /urgency/i);
});

test("rankVolunteersForNeed prefers skill, category, availability, and location fit", () => {
  const need = {
    id: "need-1",
    title: "Emergency medical delivery",
    category: "Medical",
    keywords: ["medical", "insulin", "delivery"],
    location: "District 5",
  };

  const result = rankVolunteersForNeed(need, [
    {
      id: "vol-a",
      name: "Strong Match",
      location: "District 5",
      skills: ["Medical", "Transport", "Insulin"],
      categories: ["Medical"],
      availability: "available",
      capacity: 3,
      workload: 0,
      rating: 4.8,
      pastAssignments: ["Medical"],
    },
    {
      id: "vol-b",
      name: "Weak Match",
      location: "District 9",
      skills: ["Education"],
      categories: ["Education"],
      availability: "busy",
      capacity: 1,
      workload: 1,
      rating: 5,
      pastAssignments: ["Education"],
    },
  ]);

  assert.equal(result.matches[0].volunteerId, "vol-a");
  assert.ok(result.matches[0].score > result.matches[1].score);
  assert.match(result.matches[0].reason, /skill/i);
});
