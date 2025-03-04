import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

const supabaseUrl = "https://xzdolpcdmpmtwvgdayyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZG9scGNkbXBtdHd2Z2RheXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMDgxNDIsImV4cCI6MjA0Nzc4NDE0Mn0.v3Mj867J8wvxf8jkfIlGm6JJWEdqRGyoTZVmzOx0fHQ";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Storage helpers
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error('Failed to upload image');
  }
};

// Properties helpers
export const addProperty = async (propertyData: any) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Ensure numeric price
    const price = typeof propertyData.price === 'string' 
      ? parseFloat(propertyData.price) 
      : propertyData.price;

    const insertData = {
      title: propertyData.title,
      address: propertyData.address,
      price,
      deal_type: propertyData.dealType,
      description: propertyData.description,
      images: propertyData.images || [],
      user_id: user.id,
      iq_score: Math.floor(Math.random() * 5) + 5, //confirm logic how to obtain the iq score
      repair_cost: propertyData.repairCost || 0,
      profit_for_selling: propertyData.profitForSelling || 0,
      roi: propertyData.roi || 0,
      rent: propertyData.rent || 0,
      net_cash_flow: propertyData.netCashFlow || 0,
      cash_on_cash_return: propertyData.cashOnCashReturn || 0,
      arv: propertyData.arv || 0,
      property_id: propertyData.propertyId || null,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

export const getProperties = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId: string) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Auth helpers
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};