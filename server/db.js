const { createClient } = require("@supabase/supabase-js");

// You find these in your Supabase Dashboard -> Settings -> API
const supabaseUrl = "https://your-project-id.supabase.co";
const supabaseKey = "your-anon-public-key";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
