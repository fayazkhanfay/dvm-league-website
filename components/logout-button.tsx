"use client"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
      })

      if (response.redirected) {
        window.location.href = response.url
      } else {
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
      window.location.href = "/login"
    }
  }

  return (
    <button onClick={handleLogout} className="text-sm text-brand-navy/60 underline hover:text-brand-red">
      Logout
    </button>
  )
}
