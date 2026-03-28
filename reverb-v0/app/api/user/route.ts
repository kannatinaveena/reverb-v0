import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { reverbAuthOptions } from "@/app/lib/authOptions"
import { prismaClient } from "@/app/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(reverbAuthOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("API /user error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

