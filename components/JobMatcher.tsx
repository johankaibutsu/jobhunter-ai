import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Briefcase,
  Search,
  ArrowRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import { matchJob } from "../services/geminiService";
import { JobMatchResult } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  resumeText: string;
  resumeBase64?: string;
}

export const JobMatcher: React.FC<Props> = ({ resumeText, resumeBase64 }) => {
  const [jobDesc, setJobDesc] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if ((!resumeText && !resumeBase64) || !jobDesc) return;
    setIsMatching(true);
    setError(null);
    try {
      const data = await matchJob(
        { text: resumeText, base64: resumeBase64 },
        jobDesc,
      );
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Failed to match job. Please check your API key.",
      );
    } finally {
      setIsMatching(false);
    }
  };

  const chartData = result
    ? [
        { name: "Match", value: result.matchScore },
        { name: "Gap", value: 100 - result.matchScore },
      ]
    : [];

  const COLORS = ["#4F46E5", "#E2E8F0"];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Job Description Matcher
          </h2>
          <p className="text-slate-500 mt-1">
            See how well your resume fits the role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Job Description
              </label>
              {resumeBase64 ? (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                  <FileText className="w-3 h-3" /> PDF Resume Active
                </span>
              ) : resumeText ? (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                  Text Resume Active
                </span>
              ) : null}
            </div>

            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm mb-4"
              placeholder="Paste the Job Description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
            {!resumeText && !resumeBase64 && (
              <p className="text-xs text-amber-600 mb-4">
                Please add your resume in the Resume Optimizer tab first.
              </p>
            )}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 mb-4">
                <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
              </div>
            )}
            <button
              onClick={handleMatch}
              disabled={
                isMatching || !jobDesc || (!resumeText && !resumeBase64)
              }
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {isMatching ? (
                <LoadingSpinner />
              ) : (
                <>
                  Check Match <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!result ? (
            <div className="h-full min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>Paste a JD and analyze to see your match score.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {result.jobTitle}
                  </h3>
                  <p className="text-slate-500">{result.company}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-indigo-600">
                      {result.matchScore}%
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">
                      Match
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Match Analysis
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {result.analysis}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      Cultural Fit Assessment
                    </h4>
                    <p className="text-slate-600 text-xs italic">
                      "{result.culturalFit}"
                    </p>
                  </div>
                </div>
              </div>

              {result.missingKeywords.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" /> Missing
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 shadow-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
