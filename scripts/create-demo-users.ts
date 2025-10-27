import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createDemoUsers() {
  console.log("Creating demo users...")

  // Create GP user
  const { data: gpUser, error: gpError } = await supabase.auth.admin.createUser({
    email: "gp@dvmleague.com",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Dr. Sarah Johnson",
    },
  })

  if (gpError) {
    console.error("Error creating GP user:", gpError)
  } else {
    console.log("✓ Created GP user:", gpUser.user.email)

    // Update GP profile
    const { error: gpProfileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Dr. Sarah Johnson",
        role: "gp",
        clinic_name: "Riverside Veterinary Clinic",
        clinic_address: "123 Main Street, Springfield",
        phone: "+1 (555) 123-4567",
      })
      .eq("id", gpUser.user.id)

    if (gpProfileError) {
      console.error("Error updating GP profile:", gpProfileError)
    } else {
      console.log("✓ Updated GP profile")
    }
  }

  // Create Specialist user
  const { data: specialistUser, error: specialistError } = await supabase.auth.admin.createUser({
    email: "specialist@dvmleague.com",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Dr. Michael Chen",
    },
  })

  if (specialistError) {
    console.error("Error creating Specialist user:", specialistError)
  } else {
    console.log("✓ Created Specialist user:", specialistUser.user.email)

    // Update Specialist profile
    const { error: specialistProfileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Dr. Michael Chen",
        role: "specialist",
        clinic_name: "Advanced Veterinary Specialists",
        clinic_address: "456 Oak Avenue, Springfield",
        phone: "+1 (555) 987-6543",
        specialties: ["Cardiology", "Internal Medicine"],
      })
      .eq("id", specialistUser.user.id)

    if (specialistProfileError) {
      console.error("Error updating Specialist profile:", specialistProfileError)
    } else {
      console.log("✓ Updated Specialist profile")
    }
  }

  console.log("\n✅ Demo users created successfully!")
  console.log("\nYou can now log in with:")
  console.log("GP: gp@dvmleague.com / password123")
  console.log("Specialist: specialist@dvmleague.com / password123")
}

createDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
