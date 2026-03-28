"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import StreamView from "../components/StreamView"
import 'react-toastify/dist/ReactToastify.css'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

const SimpleLoader = () => (
 <div className="flex items-center justify-center min-h-screen">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  </div>
)

export default function Component() {
  const { status } = useSession()
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")
        if (!response.ok) throw new Error("Failed to fetch user")

        const data = await response.json()
        setCreatorId(data.user.id) // Assumes the API returns { user: { id: string } }
      } catch (e) {
        console.error("Error fetching user data:", e)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchUserData()
    }
  }, [status])

  if (loading || status === "loading") return <SimpleLoader />
  if (!creatorId) return <div>Error: Unable to load user data</div>

  return <StreamView creatorId={creatorId} playVideo={true} />
}