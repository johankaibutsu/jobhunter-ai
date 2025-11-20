
import { supabase } from '../utils/supabaseClient';
import { UserProfile, SavedJob } from '../types';

// Map DB snake_case to App camelCase
const mapProfileFromDB = (data: any): UserProfile => ({
  name: data.name || '',
  email: data.email || '',
  targetRole: data.target_role || '',
  resumeText: data.resume_text || '',
  resumeBase64: data.resume_base64 || undefined,
  lastAtsScore: data.last_ats_score || 0,
  lastInterviewDate: data.last_interview_date || undefined,
  savedJobs: [], // Fetched separately
});

export const dbService = {
  /**
   * Fetch full user profile including saved jobs
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    // Use maybeSingle() to return null instead of error if row doesn't exist
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', JSON.stringify(profileError, null, 2));
      return null;
    }

    if (!profileData) {
      return null;
    }

    const { data: jobsData, error: jobsError } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId);

    if (jobsError) {
      console.error('Error fetching jobs:', JSON.stringify(jobsError, null, 2));
    }

    const profile = mapProfileFromDB(profileData);
    profile.savedJobs = jobsData?.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      url: job.url,
      description: job.description,
      dateSaved: parseInt(job.date_saved)
    })) || [];

    return profile;
  },

  /**
   * Create or Update User Profile
   */
  upsertProfile: async (userId: string, profile: Partial<UserProfile>) => {
    const updates: any = {
      id: userId,
      updated_at: new Date(),
    };

    if (profile.name) updates.name = profile.name;
    if (profile.email) updates.email = profile.email;
    if (profile.targetRole) updates.target_role = profile.targetRole;
    if (profile.resumeText !== undefined) updates.resume_text = profile.resumeText;
    if (profile.resumeBase64 !== undefined) updates.resume_base64 = profile.resumeBase64;
    if (profile.lastAtsScore !== undefined) updates.last_ats_score = profile.lastAtsScore;
    if (profile.lastInterviewDate !== undefined) updates.last_interview_date = profile.lastInterviewDate;

    const { error } = await supabase
      .from('profiles')
      .upsert(updates);

    if (error) {
      console.error('Error upserting profile:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  /**
   * Add a saved job
   */
  addSavedJob: async (userId: string, job: SavedJob) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        title: job.title,
        company: job.company,
        url: job.url,
        description: job.description,
        date_saved: job.dateSaved
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding saved job:', JSON.stringify(error, null, 2));
      throw error;
    }
    return data;
  },

  /**
   * Remove a saved job
   */
  deleteSavedJob: async (jobId: string) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting saved job:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
};
