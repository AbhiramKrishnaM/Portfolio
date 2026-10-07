import { EXPERIENCE } from "./experience.js";

const job = (company) => EXPERIENCE.find((entry) => entry.company === company);

function fromJob(company) {
  const entry = job(company);
  return {
    eyebrow: `${entry.company} · ${entry.dates}`,
    title: entry.role,
    points: entry.points,
  };
}

export const JOURNEY = [
  {
    id: "prologue",
    number: "00",
    weight: 1,
    eyebrow: "college · 3rd year → 2020",
    title: "Hello, world.",
    points: [
      "Built my first websites in the 3rd year of college",
      "Then COVID hit, and I spent it learning everything tech I could",
    ],
    tags: ["HTML", "CSS", "JavaScript"],
    beats: [
      { target: "me", title: "ABHIRAM", sub: "3rd year · first website" },
      { target: "firstPage", title: "HTML · CSS · JS", sub: "the first page" },
      { target: "books", title: "2020", sub: "lockdown: learning everything" },
    ],
  },
  {
    id: "neolen",
    number: "01",
    weight: 1.2,
    ...fromJob("Neolen"),
    tags: ["React Native", "Mobile"],
    beats: [
      { target: "phone", title: "NEOLEN", sub: "intern · mobile" },
      { target: "atom", title: "REACT NATIVE", sub: "one codebase, two stores" },
      { target: "downloads", title: "10K+ DOWNLOADS", sub: "pick your starting XI" },
    ],
  },
  {
    id: "interlude",
    number: "··",
    weight: 0.5,
    eyebrow: "between jobs",
    title: "Leveling up.",
    points: ["Took time out to go deeper into the stack before the next role"],
    tags: [],
    beats: [
      { target: "books2", title: "GAP", sub: "leveling up" },
    ],
  },
  {
    id: "caprimul",
    number: "02",
    weight: 1.2,
    ...fromJob("Caprimul Technologies"),
    tags: ["Nuxt.js", "Node.js"],
    beats: [
      { target: "packets", title: "NUXT.JS ↔ NODE.JS", sub: "first fullstack role" },
      { target: "app1", title: "MODERN ELECTRICALS", sub: "e-commerce app" },
      { target: "app2", title: "JAMBOREE", sub: "journaling app for dentists" },
    ],
  },
  {
    id: "iocod",
    number: "03",
    weight: 1.4,
    ...fromJob("IOCOD Infotech"),
    tags: ["Frontend", "AWS", "CI/CD", "Microservices"],
    beats: [
      { target: "market", title: "MERCHANT MARKETPLACE", sub: "funding startups & small businesses" },
      { target: "users", title: "600+ US USERS", sub: "in the first release" },
      { target: "cloud", title: "PIPELINES · MICROSERVICES", sub: "first steps into AWS" },
    ],
  },
  {
    id: "discern",
    number: "04",
    weight: 1.4,
    ...fromJob("Discern Security"),
    tags: ["Cybersecurity", "AWS ECS", "Glue", "Redshift", "DynamoDB"],
    beats: [
      { target: "platform", title: "ONE PLATFORM", sub: "security products, brought together" },
      { target: "shield", title: "CYBERSECURITY", sub: "frontend → backend" },
      { target: "aws", title: "ECS · GLUE · REDSHIFT · DYNAMODB", sub: "core AWS" },
    ],
  },
  {
    id: "ending",
    number: "→",
    weight: 0.8,
    eyebrow: "now",
    title: "Still building.",
    points: ["From a mobile intern to a fullstack engineer working across security and the cloud"],
    tags: [],
    beats: [
      { target: "me", title: "ABHIRAM", sub: "fullstack engineer · now" },
    ],
  },
];
