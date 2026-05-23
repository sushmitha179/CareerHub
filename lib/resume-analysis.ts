/** ATS-oriented keywords for tech internships */
export const ATS_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node",
  "nodejs",
  "express",
  "python",
  "java",
  "sql",
  "postgresql",
  "mongodb",
  "git",
  "github",
  "docker",
  "aws",
  "rest",
  "api",
  "html",
  "css",
  "tailwind",
  "agile",
  "scrum",
  "internship",
  "project",
  "certification",
  "bachelor",
  "computer science",
  "data structures",
  "algorithms",
  "problem solving",
  "communication",
  "teamwork",
  "leadership",
] as const;

export const CORE_SKILLS = [
  "javascript",
  "react",
  "node",
  "typescript",
  "python",
  "java",
  "sql",
  "mongodb",
  "git",
  "aws",
  "docker",
  "html",
  "css",
  "data structures",
  "algorithms",
] as const;

export type ResumeAnalysisResult = {
  atsScore: number;
  keywordMatchPercent: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  foundSkills: string[];
  missingSkills: string[];
  extractedSkills: string[];
  suggestions: string[];
  suitableRoles: string[];
  sectionsFound: {
    contact: boolean;
    education: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
  };
};

function hasSection(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export function analyzeResumeText(rawText: string): ResumeAnalysisResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const matchedKeywords = ATS_KEYWORDS.filter((kw) => lower.includes(kw));
  const missingKeywords = ATS_KEYWORDS.filter((kw) => !lower.includes(kw));

  const keywordMatchPercent = Math.round(
    (matchedKeywords.length / ATS_KEYWORDS.length) * 100
  );

  const foundSkills = CORE_SKILLS.filter((s) => lower.includes(s));
  const missingSkills = CORE_SKILLS.filter((s) => !lower.includes(s));

  const skillPatterns = [
    /\b(javascript|typescript|react|angular|vue|node\.?js|python|java|c\+\+|go|rust|sql|mongodb|postgresql|aws|azure|gcp|docker|kubernetes|git|figma|tailwind)\b/gi,
  ];
  const extractedSet = new Set<string>();
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => extractedSet.add(m.toLowerCase()));
    }
  }
  foundSkills.forEach((s) => extractedSet.add(s));
  const extractedSkills = Array.from(extractedSet).slice(0, 20);

  const sectionsFound = {
    contact: hasSection(lower, [/email|phone|linkedin|@/]),
    education: hasSection(lower, [/education|university|college|b\.?tech|bachelor/i]),
    experience: hasSection(lower, [/experience|intern|work history|employment/i]),
    projects: hasSection(lower, [/project|portfolio|built|developed/i]),
    skills: hasSection(lower, [/skills|technical skills|technologies/i]),
  };

  const sectionScore =
    (Object.values(sectionsFound).filter(Boolean).length / 5) * 30;

  const lengthScore = text.length > 400 ? 20 : text.length > 150 ? 10 : 0;
  const keywordScore = (keywordMatchPercent / 100) * 50;

  const atsScore = Math.min(
    100,
    Math.round(sectionScore + lengthScore + keywordScore)
  );

  const suggestions: string[] = [];

  if (!sectionsFound.contact) {
    suggestions.push("Add clear contact details (email, phone, LinkedIn).");
  }
  if (!sectionsFound.education) {
    suggestions.push("Include an Education section with degree and college.");
  }
  if (!sectionsFound.experience && !sectionsFound.projects) {
    suggestions.push(
      "Add Experience or Projects with measurable outcomes (metrics, impact)."
    );
  }
  if (!sectionsFound.skills) {
    suggestions.push("Add a dedicated Skills section with tools and frameworks.");
  }
  if (keywordMatchPercent < 40) {
    suggestions.push(
      "Increase ATS keyword coverage: mirror terms from job descriptions."
    );
  }
  if (text.length < 300) {
    suggestions.push("Resume text is short — expand with projects and achievements.");
  }
  if (missingSkills.length > 8) {
    suggestions.push(
      `Consider highlighting: ${missingSkills.slice(0, 5).join(", ")}.`
    );
  }

  const suitableRoles: string[] = [];
  if (foundSkills.includes("react") || foundSkills.includes("javascript")) {
    suitableRoles.push("Frontend Developer Intern");
  }
  if (foundSkills.includes("node") || foundSkills.includes("python")) {
    suitableRoles.push("Backend Developer Intern");
  }
  if (foundSkills.includes("react") && foundSkills.includes("node")) {
    suitableRoles.push("Full Stack Developer Intern");
  }
  if (suitableRoles.length === 0) {
    suitableRoles.push("Software Engineering Intern", "Technology Analyst Trainee");
  }

  return {
    atsScore,
    keywordMatchPercent,
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 12),
    foundSkills,
    missingSkills,
    extractedSkills,
    suggestions,
    suitableRoles,
    sectionsFound,
  };
}
