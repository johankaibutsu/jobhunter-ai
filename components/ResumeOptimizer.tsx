import React, { useState } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Eye,
} from "lucide-react";
import { analyzeResume } from "../services/geminiService";
import { AnalysisResult } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

interface Props {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeBase64?: string;
  setResumeBase64: (base64: string | undefined) => void;
  onAnalysisComplete: (score: number) => void;
}

export const ResumeOptimizer: React.FC<Props> = ({
  resumeText,
  setResumeText,
  resumeBase64,
  setResumeBase64,
  onAnalysisComplete,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // State for overwrite confirmation modal
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFileName(file.name);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];

        // Check if existing resume exists
        if (resumeBase64) {
          setPendingBase64(base64String);
          setShowOverwriteModal(true);
        } else {
          // Auto save if empty
          setResumeBase64(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmOverwrite = () => {
    if (pendingBase64) {
      setResumeBase64(pendingBase64);
    }
    setPendingBase64(null);
    setShowOverwriteModal(false);
  };

  const cancelOverwrite = () => {
    setPendingBase64(null);
    setShowOverwriteModal(false);
    setFileName(""); // clear selection
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !resumeBase64) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const input =
        activeTab === "upload" && resumeBase64
          ? { base64: resumeBase64, mimeType: "application/pdf" }
          : { text: resumeText };

      const data = await analyzeResume(input);
      setResult(data);
      onAnalysisComplete(data.atsScore);

      if (data.summary && !resumeText) {
        setResumeText(`[Extracted Summary from PDF]: ${data.summary}`);
      }

      // Generate PDF blob for "Improved Resume"
      generatePdfBlob(data.rewrittenResume);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePdfBlob = (text: string) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const splitText = doc.splitTextToSize(text, 180);
    let y = 20;

    doc.text("AI Improved Resume Suggestion", 105, 10, { align: "center" });

    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 15, y);
      y += 7;
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  const clearFile = () => {
    setResumeBase64(undefined);
    setFileName("");
    setResult(null);
    setPdfUrl(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const atsData = result
    ? [
        { name: "Score", value: result.atsScore },
        { name: "Gap", value: 100 - result.atsScore },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in relative">
      {/* Overwrite Modal */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Update Profile Resume?
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              You already have a resume saved in your profile. Do you want to
              replace it with this new file?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelOverwrite}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                No, Keep Old
              </button>
              <button
                onClick={confirmOverwrite}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Yes, Replace
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Resume Optimizer & ATS Check
          </h2>
          <p className="text-slate-500 mt-1">
            Upload your PDF or paste text to get an AI analysis and a rewritten
            version.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "upload" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "text" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              Paste Text
            </button>
          </div>

          {activeTab === "upload" ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 min-h-[300px]">
              {resumeBase64 || fileName ? (
                <div className="text-center w-full">
                  <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                  <p className="font-medium text-slate-900 mb-2">
                    {fileName || "Resume Loaded from Profile"}
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    Ready to analyze
                  </p>
                  <button
                    onClick={clearFile}
                    className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center justify-center gap-1 mx-auto"
                  >
                    <X className="w-4 h-4" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">
                    Drag & drop your resume PDF here
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    id="resume-upload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          ) : (
            <textarea
              className="flex-1 min-h-[300px] w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={
                isAnalyzing ||
                (activeTab === "upload" ? !resumeBase64 : !resumeText)
              }
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {isAnalyzing ? (
                <LoadingSpinner />
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" /> Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit min-h-[400px]">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {!result && !isAnalyzing && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
              <p>Analysis results will appear here.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <LoadingSpinner />
              <p className="mt-4">
                Scanning for ATS keywords and formatting...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-slide-up">
              {/* ATS Score Card */}
              <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-1">
                    ATS Compatibility Score
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Based on industry standards
                  </p>
                </div>
                <div className="w-24 h-24 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={atsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={45}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill={getScoreColor(result.atsScore)} />
                        <Cell fill="#334155" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xl font-bold"
                      style={{ color: getScoreColor(result.atsScore) }}
                    >
                      {result.atsScore}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Summary
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {result.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-green-900 text-xs"
                      >
                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Improvements
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-red-900 text-xs"
                      >
                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improved Resume Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" /> AI Improved
                    Resume
                  </h3>
                </div>

                {pdfUrl ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="h-64 rounded-lg border border-slate-300 overflow-hidden mb-4 bg-white">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="Resume PDF"
                      />
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </a>
                      <a
                        href={pdfUrl}
                        download="Improved_Resume.pdf"
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm">
                    generating document...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
