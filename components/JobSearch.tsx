import React, { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Globe,
  Sparkles,
  Bookmark,
  Check,
  Filter,
  AlertCircle,
} from "lucide-react";
import { findJobs } from "../services/geminiService";
import { LoadingSpinner } from "./LoadingSpinner";
import ReactMarkdown from "react-markdown";
import { SavedJob, JobSearchFilters } from "../types";

interface Props {
  resumeSummary: string;
  resumeBase64?: string;
  onSaveJob: (job: SavedJob) => void;
}

export const JobSearch: React.FC<Props> = ({
  resumeSummary,
  resumeBase64,
  onSaveJob,
}) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    groundingChunks: any[];
  } | null>(null);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    datePosted: "any",
    experienceLevel: "any",
    minSalary: "any",
  });

  const handleSearch = async (useResume: boolean = false) => {
    if (!useResume && !query.trim()) return;
    setIsSearching(true);
    setResult(null);
    setError(null);

    try {
      // If using resume, query is ignored/handled by the service logic
      const searchQuery = useResume
        ? ""
        : `${query} jobs ${location ? `in ${location}` : ""}`;

      const userContext = {
        text: resumeSummary,
        base64: resumeBase64,
      };

      const data = await findJobs(searchQuery, userContext, useResume, filters);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Failed to search jobs. Please check your API key or internet connection.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = (job: SavedJob) => {
    onSaveJob(job);
    setSavedUrls((prev) => new Set(prev).add(job.url || ""));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Smart Job Search</h2>
        <p className="text-slate-500 mt-1">
          Find relevant opportunities across the web matched to your profile.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Job Title (e.g. React Developer)"
              className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Location (e.g. Remote, New York)"
              className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all ${showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              title="Toggle Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSearch(false)}
              disabled={isSearching || !query}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 flex justify-center items-center gap-2"
            >
              {isSearching ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Search className="w-5 h-5" /> Search
                </>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Date Posted
              </label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={filters.datePosted}
                onChange={(e) =>
                  setFilters({ ...filters, datePosted: e.target.value })
                }
              >
                <option value="any">Any Time</option>
                <option value="past 24 hours">Past 24 Hours</option>
                <option value="past 3 days">Past 3 Days</option>
                <option value="past week">Past Week</option>
                <option value="past month">Past Month</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Experience Level
              </label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={filters.experienceLevel}
                onChange={(e) =>
                  setFilters({ ...filters, experienceLevel: e.target.value })
                }
              >
                <option value="any">Any Level</option>
                <option value="internship">Internship</option>
                <option value="entry level">Entry Level</option>
                <option value="associate">Associate</option>
                <option value="mid-senior level">Mid-Senior Level</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Minimum Salary
              </label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={filters.minSalary}
                onChange={(e) =>
                  setFilters({ ...filters, minSalary: e.target.value })
                }
              >
                <option value="any">Any Salary</option>
                <option value="$40,000">$40,000+</option>
                <option value="$60,000">$60,000+</option>
                <option value="$80,000">$80,000+</option>
                <option value="$100,000">$100,000+</option>
                <option value="$120,000">$120,000+</option>
                <option value="$150,000">$150,000+</option>
                <option value="$200,000">$200,000+</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100"></div>
          <span className="text-xs text-slate-400 font-medium">OR</span>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => handleSearch(true)}
            disabled={isSearching || (!resumeSummary && !resumeBase64)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 flex justify-center items-center gap-2 w-full md:w-auto"
          >
            {isSearching ? (
              <LoadingSpinner />
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Match My Resume Automatically
              </>
            )}
          </button>
        </div>
        {!resumeSummary && !resumeBase64 && (
          <p className="text-xs text-center text-amber-600 mt-2">
            Upload a resume in the Optimizer tab to use automatic matching.
          </p>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
              <h3 className="text-xl font-bold text-slate-900 not-prose mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                AI Search Results
              </h3>
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Sources & Opportunities
              </h3>
              {result.groundingChunks && result.groundingChunks.length > 0 ? (
                <div className="space-y-3">
                  {result.groundingChunks.map((chunk: any, idx: number) => {
                    if (chunk.web?.uri) {
                      const isSaved = savedUrls.has(chunk.web.uri);
                      return (
                        <div
                          key={idx}
                          className="block bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <a
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 truncate flex-1"
                            >
                              {chunk.web.title || chunk.web.uri}
                            </a>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 truncate mb-3">
                            {chunk.web.uri}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleSave({
                                  id: crypto.randomUUID(),
                                  title: chunk.web.title || "Unknown Job",
                                  company: "Unknown Company",
                                  url: chunk.web.uri,
                                  dateSaved: Date.now(),
                                })
                              }
                              disabled={isSaved}
                              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                                isSaved
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              {isSaved ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Bookmark className="w-3 h-3" />
                              )}
                              {isSaved ? "Saved" : "Save Job"}
                            </button>
                            <a
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                              title="Open Link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No direct links returned. Please check the text description.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isSearching && (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Search for jobs manually or let AI match them to your resume.</p>
        </div>
      )}
    </div>
  );
};
