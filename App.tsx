import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { ResumeOptimizer } from "./components/ResumeOptimizer";
import { JobMatcher } from "./components/JobMatcher";
import { InterviewCoach } from "./components/InterviewCoach";
import { JobSearch } from "./components/JobSearch";
import { AuthPage } from "./components/AuthPage";
import { Profile } from "./components/Profile";
import { Page, UserProfile, SavedJob } from "./types";
import { INITIAL_USER_PROFILE } from "./constants";
import { supabase } from "./utils/supabaseClient";
import { dbService } from "./services/dbService";
import { LoadingSpinner } from "./components/LoadingSpinner";

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [userProfile, setUserProfile] =
    useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isDemo, setIsDemo] = useState(false);

  // Handle Authentication Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsDemo(false); // Ensure we exit demo mode if a real session is found
        loadUserData(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name,
          session.user.user_metadata?.target_role,
        );
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsDemo(false);
        loadUserData(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name,
          session.user.user_metadata?.target_role,
        );
      } else {
        // Only reset if we are NOT in demo mode
        if (!isDemo) {
          setUserProfile(INITIAL_USER_PROFILE);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const loadUserData = async (
    userId: string,
    email?: string,
    fullName?: string,
    targetRole?: string,
  ) => {
    try {
      const profile = await dbService.getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      } else {
        console.log("No profile found, creating default profile...");
        const newProfile = {
          ...INITIAL_USER_PROFILE,
          email: email || "user@example.com",
          name: fullName || "User",
          targetRole: targetRole || "Job Seeker",
        };
        await dbService.upsertProfile(userId, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("Error loading user data:", JSON.stringify(error, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsDemo(true);
    // Load a nice looking dummy profile for the demo
    setUserProfile({
      ...INITIAL_USER_PROFILE,
      name: "Demo User",
      email: "demo@jobhunter.ai",
      targetRole: "Senior React Developer",
      resumeText: `Experienced Frontend Developer with 5 years of expertise in building scalable web applications using React, TypeScript, and Node.js.

Skills:
- Frontend: React, Vue.js, Tailwind CSS, Redux
- Backend: Node.js, Express, PostgreSQL
- Tools: Git, Docker, AWS

Experience:
- Senior Developer at TechCorp (2020-Present): Led migration to React 18, improved load times by 40%.
- Frontend Engineer at StartupInc (2018-2020): Built MVP from scratch using MERN stack.
      `,
      lastAtsScore: 75,
    });
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsDemo(false);
    if (session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setCurrentPage(Page.DASHBOARD);
    setUserProfile(INITIAL_USER_PROFILE);
  };

  // -- State Updating Wrappers that Sync with DB --

  const updateResumeText = async (text: string) => {
    setUserProfile((prev) => ({ ...prev, resumeText: text }));
    if (session?.user) {
      await dbService.upsertProfile(session.user.id, { resumeText: text });
    }
  };

  const updateResumeBase64 = async (base64: string | undefined) => {
    setUserProfile((prev) => ({ ...prev, resumeBase64: base64 }));
    if (session?.user) {
      await dbService.upsertProfile(session.user.id, { resumeBase64: base64 });
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    if (session?.user) {
      await dbService.upsertProfile(session.user.id, {
        name: updatedProfile.name,
        email: updatedProfile.email,
        targetRole: updatedProfile.targetRole,
      });
    }
  };

  const handleSaveJob = async (job: SavedJob) => {
    // Optimistic update (This works for Demo user too, just local state)
    setUserProfile((prev) => {
      if (
        prev.savedJobs.some((j) => j.url === job.url && j.title === job.title)
      )
        return prev;
      return { ...prev, savedJobs: [...prev.savedJobs, job] };
    });

    if (session?.user) {
      try {
        const saved = await dbService.addSavedJob(session.user.id, job);
        // Update state with real ID from DB
        setUserProfile((prev) => ({
          ...prev,
          savedJobs: prev.savedJobs.map((j) =>
            j.id === job.id ? { ...j, id: saved.id } : j,
          ),
        }));
      } catch (e) {
        console.error("Failed to save job to DB", e);
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      savedJobs: prev.savedJobs.filter((j) => j.id !== jobId),
    }));

    if (session?.user) {
      try {
        await dbService.deleteSavedJob(jobId);
      } catch (e) {
        console.error("Failed to delete job from DB", e);
      }
    }
  };

  const handleUpdateAtsScore = async (score: number) => {
    setUserProfile((prev) => ({ ...prev, lastAtsScore: score }));
    if (session?.user) {
      await dbService.upsertProfile(session.user.id, { lastAtsScore: score });
    }
  };

  const handleUpdateInterviewDate = async () => {
    const date = Date.now();
    setUserProfile((prev) => ({ ...prev, lastInterviewDate: date }));
    if (session?.user) {
      await dbService.upsertProfile(session.user.id, {
        lastInterviewDate: date,
      });
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard setPage={setCurrentPage} userProfile={userProfile} />;
      case Page.PROFILE:
        return (
          <Profile
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onDeleteJob={handleDeleteJob}
          />
        );
      case Page.RESUME_OPTIMIZER:
        return (
          <ResumeOptimizer
            resumeText={userProfile.resumeText}
            setResumeText={updateResumeText}
            resumeBase64={userProfile.resumeBase64}
            setResumeBase64={updateResumeBase64}
            onAnalysisComplete={handleUpdateAtsScore}
          />
        );
      case Page.JOB_MATCHER:
        return <JobMatcher resumeText={userProfile.resumeText} />;
      case Page.JOB_SEARCH:
        const context = userProfile.resumeText.substring(0, 1500);
        return <JobSearch resumeSummary={context} onSaveJob={handleSaveJob} />;
      case Page.INTERVIEW_COACH:
        return (
          <InterviewCoach
            targetRole={userProfile.targetRole}
            onSessionStart={handleUpdateInterviewDate}
          />
        );
      default:
        return <Dashboard setPage={setCurrentPage} userProfile={userProfile} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session && !isDemo) {
    return <AuthPage onLogin={() => {}} onDemoLogin={handleDemoLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navigation
        currentPage={currentPage}
        setPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
        {isDemo && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold text-center">
            DEMO MODE: Changes will not be saved after you refresh the page.
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
