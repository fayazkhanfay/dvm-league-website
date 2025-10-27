"use client"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
      })

      if (response.ok) {
        // Force a hard navigation to clear all client-side state
        window.location.href = "/login"
      } else {
        console.error("Logout failed")
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
      // Still redirect to login even if there's an error
      window.location.href = "/login"
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-brand-navy/60 underline hover:text-brand-red transition-colors duration-200 cursor-pointer hover:opacity-80"
    >
      Logout
    </button>
  )
}
