import { createHash } from "node:crypto";

import aarityaLogo from "./assets/sahi.png";
import gojekLogo from "./assets/gojek.svg";
import docutalkLogo from "./assets/docutalk.png";
import directiLogo from "./assets/directi.png";

export const SITE_TITLE = "spy16.in";
export const SITE_DESCRIPTION = "A small corner of Prasad's brain: posts on engineering and AI.";
export const TWITTER_HANDLE = "@spy16x";
const EMAIL = "shiv.ylp@gmail.com";

export const AVATAR = `https://www.gravatar.com/avatar/${createHash("md5").update(EMAIL).digest("hex")}?s=512`;

export const EXPERIENCE = new Date().getFullYear() - 2016;

export const LOBES = {
  ai: { name: "AI & Assistants", rgb: "180,140,255" },
  engineering: { name: "Software Engineering", rgb: "79,209,255" },
} as const;

export type Lobe = keyof typeof LOBES;

export const SOCIALS = [
  { label: "github", url: "https://github.com/spy16" },
  { label: "x", url: "https://twitter.com/spy16x" },
  { label: "linkedin", url: "https://linkedin.com/in/shivaprasadbhat" },
  { label: "instagram", url: "https://instagram.com/spy16x" },
  { label: "mail", url: `mailto:${EMAIL}` },
];

export const SKILLS = ["Rust", "Go", "Kafka", "Redis", "Postgres", "AWS", "Clojure", "SvelteKit"];

export const WORK = [
  {
    company: "Sahi Trading App",
    role: "Software Engineer",
    duration: "Nov 2023 – now",
    logo: aarityaLogo,
    href: "https://sahi.com?utm_source=spy16.in",
  },
  {
    company: "DocuTalk (acquired)",
    role: "Founder",
    duration: "Feb 2023 – Aug 2023",
    logo: docutalkLogo,
    href: "/posts/engineering/docutalk/",
  },
  {
    company: "GoJek",
    role: "Product Engineer",
    duration: "Jul 2018 – Nov 2023",
    logo: gojekLogo,
    href: "https://gojek.com",
  },
  {
    company: "Directi",
    role: "Software Engineer",
    duration: "Jul 2016 – Jul 2018",
    logo: directiLogo,
    href: "https://directi.com",
  },
];
