"use client";

import { useState } from "react";

type Analysis = {
  source?: string;
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
  aiSummary?: string | null;
  error?: string;
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const stroke =
    score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";

  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className={`text-3xl font-bold -mt-[88px] mb-8 ${color}`}>{score}</p>
      <p className="text-sm text-gray-500 font-medium">ATS Score</p>
    </div>
  );
}

function SectionCheck({
  label,
  ok,
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
        ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
      }`}
    >
      <span>{label}</span>
      <span>{ok ? "✓" : "✗"}</span>
    </div>
  );
}

export default function AnalyzerPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"paste" | "upload">("paste");

  async function runAnalysis(useUploadedResume: boolean) {
    setLoading(true);
    setResult(null);
    setMode(useUploadedResume ? "upload" : "paste");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useUploadedResume ? { useUploadedResume: true } : { text }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ error: data.error, atsScore: 0, keywordMatchPercent: 0, matchedKeywords: [], missingKeywords: [], foundSkills: [], missingSkills: [], extractedSkills: [], suggestions: [], suitableRoles: [], sectionsFound: { contact: false, education: false, experience: false, projects: false, skills: false } });
        return;
      }

      setResult(data);
      if (!useUploadedResume && data.source === "paste") {
        // keep text
      }
    } catch {
      setResult({
        error: "Analysis failed",
        atsScore: 0,
        keywordMatchPercent: 0,
        matchedKeywords: [],
        missingKeywords: [],
        foundSkills: [],
        missingSkills: [],
        extractedSkills: [],
        suggestions: [],
        suitableRoles: [],
        sectionsFound: {
          contact: false,
          education: false,
          experience: false,
          projects: false,
          skills: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-gray-600 mt-2">
          ATS score, keyword matching, skill extraction, and improvement tips.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <textarea
          placeholder="Paste resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runAnalysis(false)}
            disabled={!text.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-50 text-sm font-medium"
          >
            {loading && mode === "paste" ? "Analyzing..." : "Analyze text"}
          </button>
          <button
            onClick={() => runAnalysis(true)}
            disabled={loading}
            className="border border-indigo-300 text-indigo-700 px-5 py-2.5 rounded-lg hover:bg-indigo-50 disabled:opacity-50 text-sm font-medium"
          >
            {loading && mode === "upload" ? "Analyzing..." : "Analyze uploaded PDF"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Upload your resume on{" "}
          <a href="/student/profile" className="text-blue-600 underline">
            Profile
          </a>{" "}
          first to use PDF analysis (DOC/DOCX: paste text).
        </p>
      </div>

      {result?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-6 flex justify-center">
              <ScoreRing score={result.atsScore} />
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm text-gray-500">Keyword match</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">
                {result.keywordMatchPercent}%
              </p>
              <div className="w-full bg-gray-200 h-2 rounded mt-3">
                <div
                  className="bg-indigo-500 h-2 rounded transition-all"
                  style={{ width: `${result.keywordMatchPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {result.matchedKeywords.length} matched ·{" "}
                {result.missingKeywords.length} missing
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 space-y-2">
              <p className="text-sm font-medium text-gray-700">Sections detected</p>
              <SectionCheck label="Contact" ok={result.sectionsFound.contact} />
              <SectionCheck label="Education" ok={result.sectionsFound.education} />
              <SectionCheck label="Experience" ok={result.sectionsFound.experience} />
              <SectionCheck label="Projects" ok={result.sectionsFound.projects} />
              <SectionCheck label="Skills" ok={result.sectionsFound.skills} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold mb-3">Matched keywords</h2>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.length ? (
                  result.matchedKeywords.map((k) => (
                    <span
                      key={k}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">None</span>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold mb-3">Missing keywords</h2>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.slice(0, 12).map((k) => (
                  <span
                    key={k}
                    className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-3">Extracted skills</h2>
            <div className="flex flex-wrap gap-2">
              {result.extractedSkills.map((s) => (
                <span
                  key={s}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-3">Improvement suggestions</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-3">Suggested roles</h2>
            <div className="flex flex-wrap gap-2">
              {result.suitableRoles.map((r) => (
                <span
                  key={r}
                  className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-lg"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {result.aiSummary && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold mb-3">AI coach summary</h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {result.aiSummary}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
