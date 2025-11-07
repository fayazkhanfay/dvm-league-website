import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") })

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

  let gpUserId: string | null = null
  let specialistUserId: string | null = null

  // Create or get GP user
  const { data: gpUser, error: gpError } = await supabase.auth.admin.createUser({
    email: "gp@dvmleague.com",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Dr. Sarah Johnson",
    },
  })

  if (gpError) {
    if (gpError.message.includes("already been registered") || gpError.code === "email_exists") {
      console.log("GP user already exists, fetching user...")
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingGpUser = users.users.find(u => u.email === "gp@dvmleague.com")
      if (existingGpUser) {
        gpUserId = existingGpUser.id
        console.log("✓ Found existing GP user")
      }
    } else {
      console.error("Error creating GP user:", gpError)
    }
  } else {
    gpUserId = gpUser.user.id
    console.log("✓ Created GP user:", gpUser.user.email)
  }

  // Create or get Specialist user
  const { data: specialistUser, error: specialistError } = await supabase.auth.admin.createUser({
    email: "specialist@dvmleague.com",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Dr. Michael Chen",
    },
  })

  if (specialistError) {
    if (specialistError.message.includes("already been registered") || specialistError.code === "email_exists") {
      console.log("Specialist user already exists, fetching user...")
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingSpecialistUser = users.users.find(u => u.email === "specialist@dvmleague.com")
      if (existingSpecialistUser) {
        specialistUserId = existingSpecialistUser.id
        console.log("✓ Found existing Specialist user")
      }
    } else {
      console.error("Error creating Specialist user:", specialistError)
    }
  } else {
    specialistUserId = specialistUser.user.id
    console.log("✓ Created Specialist user:", specialistUser.user.email)
  }

  // Update GP profile
  if (gpUserId) {
    const { error: gpProfileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Dr. Sarah Johnson",
        role: "gp",
        clinic_name: "Riverside Veterinary Clinic",
        specialty: null,
      })
      .eq("id", gpUserId)

    if (gpProfileError) {
      console.error("Error updating GP profile:", gpProfileError)
    } else {
      console.log("✓ Updated GP profile")
    }
  }

  // Update Specialist profile
  if (specialistUserId) {
    const { error: specialistProfileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Dr. Michael Chen",
        role: "specialist",
        clinic_name: "Advanced Veterinary Specialists",
        specialty: "Cardiology",
      })
      .eq("id", specialistUserId)

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
