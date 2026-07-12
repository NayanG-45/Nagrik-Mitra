import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get currently authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { title, description, category, urgency, raw_input, drafted_complaint, submission_steps } = await request.json();

    if (!title || !drafted_complaint) {
      return NextResponse.json({ success: false, error: "Title and drafted complaint are required" }, { status: 400 });
    }

    // Insert new grievance row
    const { data, error } = await supabase
      .from("grievances")
      .insert({
        user_id: user.id,
        title,
        description: description || title,
        category: category || "General",
        urgency: urgency || "medium",
        status: "pending",
        raw_input: raw_input || "",
        drafted_complaint,
        submission_steps: submission_steps || [],
        department: category || "General",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase grievance insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Grievance registered and saved successfully!",
      grievance: data,
    });
  } catch (error) {
    console.error("Error in complaints save route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
