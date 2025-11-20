import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import {
  User,
  Mail,
  Briefcase,
  Save,
  Trash2,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onDeleteJob: (id: string) => void;
}

export const Profile: React.FC<Props> = ({
  userProfile,
  onUpdateProfile,
  onDeleteJob,
}) => {
  const [formData, setFormData] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [expandResume, setExpandResume] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
          <p className="text-slate-500 mt-1">
            Manage your personal information and saved opportunities.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing ? "bg-slate-200 text-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
        >
          {isEditing ? "Cancel" : "Edit Details"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> Personal Info
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> {formData.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Target Role
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.targetRole}
                    onChange={(e) =>
                      setFormData({ ...formData, targetRole: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                    {formData.targetRole}
                  </p>
                )}
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              )}
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> My Resume
              </h3>
            </div>

            {formData.resumeBase64 ? (
              <div className="space-y-3">
                <div
                  className={`relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 ${expandResume ? "h-[500px]" : "h-40"}`}
                >
                  <iframe
                    src={`data:application/pdf;base64,${formData.resumeBase64}`}
                    className="w-full h-full"
                    title="Resume PDF Preview"
                  />
                  {!expandResume && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandResume(!expandResume)}
                    className="flex-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 bg-indigo-50 py-2 rounded-lg transition-colors"
                  >
                    {expandResume ? (
                      <>
                        Show Less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Preview <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                  <a
                    href={`data:application/pdf;base64,${formData.resumeBase64}`}
                    download="My_Resume.pdf"
                    className="flex-1 text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1 bg-slate-100 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              </div>
            ) : formData.resumeText ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-2 font-semibold">
                  Raw Text Only
                </p>
                <p className="text-sm text-slate-700 line-clamp-4 font-mono">
                  {formData.resumeText}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Upload a PDF in Resume Optimizer for better results.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm italic">
                  No resume found.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Go to Resume Optimizer to upload.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Jobs */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Saved Opportunities
              </h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                {formData.savedJobs?.length || 0} Saved
              </span>
            </div>

            {formData.savedJobs && formData.savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {formData.savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50 hover:bg-white group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">
                          {job.title}
                        </h4>
                        <p className="text-sm text-slate-600">{job.company}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Saved on{" "}
                          {new Date(job.dateSaved).toLocaleDateString()}
                        </p>
                        {job.description && (
                          <details className="mt-2">
                            <summary className="text-xs text-indigo-600 cursor-pointer hover:underline">
                              View Description
                            </summary>
                            <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-slate-200">
                              {job.description.substring(0, 300)}...
                            </p>
                          </details>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Job"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>You haven't saved any jobs yet.</p>
                <p className="text-sm mt-2">
                  Go to "Find Jobs" to start looking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
