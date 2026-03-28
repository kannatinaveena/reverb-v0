"use client"

import { Button } from "@/components/ui/button"
// @@ts-expect-error
import { Music, Radio, Users, Wand2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Appbar } from "@/app/components/Appbar"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"

export default function Landingpage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleStartStreaming = () => {
    if (session?.user) router.push("/streamspage")
    else router.push("/api/auth/signin")
  }

  return (
    <div className="min-h-screen font-vibe bg-slate-900 text-white">
      <Appbar />

      <section className="container pt-32 pb-20">
        <div className="relative mx-auto max-w-4xl text-center space-y-10">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,_rgba(128,90,213,0.4),transparent_60%)]" />

          <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-4 py-1 text-sm shadow ring-1 ring-white/10">
            <Wand2 className="h-4 w-4" /> Vibe check: Passed.
          </span>

          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight text-white">
            Where&nbsp;Your&nbsp;Audience
            <span className="block bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent drop-shadow-md">
              Became the&nbsp;DJ
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Build a stream where anyone can toss in YouTube tracks,
            vote up their faves, and shape the playlist live.
            It&apos;s like a house party — but the aux is shared.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30"
              onClick={handleStartStreaming}
            >
              Start&nbsp;Streaming
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-500 hover:bg-purple-600/10"
            >
              Join&nbsp;as&nbsp;Listener
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-18 px-28">
        <div className="grid gap-10 lg:grid-cols-3">
          {[
            {
              icon: <Radio className="h-7 w-7" />,
              title: "Create Your Stream",
              desc: "Spin up a room and set the vibe. Watch your community grow in seconds.",
            },
            {
              icon: <Music className="h-7 w-7" />,
              title: "Let Them Choose",
              desc: "Listeners up-vote songs and drive the playlist while you focus on the mix.",
            },
            {
              icon: <Users className="h-7 w-7" />,
              title: "Engage the Crowd",
              desc: "Chat, share reactions, and discover new tracks together — live.",
            },
          ].map((f, i) => (
            <article
              key={i}
              className="group relative overflow-hidden rounded-xl bg-slate-800/60 p-10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-600/30"
            >
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top_left,_rgba(128,90,213,0.15),transparent_70%)]" />
              <div className="space-y-5">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-purple-600/10 text-purple-600">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="text-white/70">{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-28 relative">
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,_rgba(128,90,213,0.25),transparent_70%)]" />

        <div className="mx-auto max-w-2xl text-center space-y-12">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to&nbsp;<span className="text-purple-500">Revolutionize</span>&nbsp;Your Vibe?
          </h2>

          <p className="text-lg text-white/70">
            Join the wait-list and be the first to experience the future of interactive music.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your best email"
              className="h-12 flex-1 rounded-lg bg-white/10 placeholder-white/60 text-white"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30"
            >
              Join&nbsp;Waitlist
            </Button>
          </form>

          <p className="text-xs text-white/50">
            By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy&nbsp;Policy</a>.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="container px-32 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <Image
            src="/reverb-new.png"
            alt="Logo"
            width={80}
            height={64}
            className="w-20 h-16"
          />
          <span className="text-white/50">&copy; 2025 reverB — All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
