"use client";

import { useState } from "react";

export default function AnalyzerPage() {
    const [text, setText] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function analyze() {
        setLoading(true);

        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        const data = await res.json();
        setResult(data);
        setLoading(false);
    }

    return (
        <div>

            <h1 className="text-3xl font-bold mb-4">
                AI Resume Analyzer 🚀
            </h1>

            {/* INPUT */}
            <textarea
                placeholder="Paste your resume text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 p-4 border rounded-lg mb-4"
            />

            <button
                onClick={analyze}
                disabled={!text || loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
            {loading && <p className="mt-4">Analyzing with AI...</p>}

            {/* RESULT */}
            {result && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow space-y-4">

                    <div>
                        <h2 className="font-semibold">✅ Found Skills</h2>
                        <p>{result.foundSkills?.join(", ") || "None"}</p>
                    </div>

                    <div>
                        <h2 className="font-semibold">❌ Missing Skills</h2>
                        <p>{result.missingSkills?.join(", ") || "None"}</p>
                    </div>

                    {/* 🔥 NEW AI OUTPUT */}
                    {result.aiFeedback && (
                        <div>
                            <h2 className="font-semibold">🤖 AI Analysis</h2>
                            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded mt-2">
                                {result.aiFeedback}
                            </pre>
                        </div>
                    )}

                    {/* 🔥 fallback */}
                    {result.fallback && (
                        <p className="text-red-500">
                            AI failed, showing basic analysis only.
                        </p>
                    )}


                </div>
            )}

        </div>
    );
}