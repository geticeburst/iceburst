import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfhlfrqppvzxxyvaspfr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaGxmcnFwcHZ6eHh5dmFzcGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI0ODMyNzIsImV4cCI6MjAxODA1OTI3Mn0.XaFTcB50OZyoTlJmrAMt0dOMk9JkbTuSfJb6nLABP5c';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
