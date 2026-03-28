import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth/next";
//@@ts-expect-error
import { reverbAuthOptions } from "@/app/lib/authOptions";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(reverbAuthOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 403 }
      );
    }

    const data = CreateStreamSchema.parse(await req.json());

    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json(
        { message: "Invalid YouTube URL format" },
        { status: 411 }
      );
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 403 }
      );
    }

    let extractedId = data.url.split("?v=")[1];
    if (!extractedId) {
      const shortUrlMatch = data.url.match(/youtu\.be\/([\w-]+)/);
      if (shortUrlMatch) {
        extractedId = shortUrlMatch[1];
      }
    }

    if (!extractedId) {
      return NextResponse.json(
        { message: "Could not extract video ID" },
        { status: 411 }
      );
    }

    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY,
      });
      const res = await youtube.videos.list({
        part: ['snippet'],
        id: [extractedId],
      });

      if (!res.data.items || res.data.items.length === 0) {
        console.error("YouTube API Error: No video found", res.data);
        return NextResponse.json(
          { message: "Error fetching video details from YouTube (no video found)" },
          { status: 500 }
        );
      }

      const video = res.data.items[0];
      const snippet = video.snippet!;

      const thumbnails = Object.values(snippet.thumbnails!).sort((a: {width: number}, b: {width: number}) => a.width - b.width);

      const existingActiveStream = await prismaClient.stream.count({
        where: {
          userId: data.creatorId,
        },
      });

      if (existingActiveStream > MAX_QUEUE_LEN) {
        return NextResponse.json(
          { message: "Already at Limit" },
          { status: 411 }
        );
      }

      const stream = await prismaClient.stream.create({
        data: {
          userId: data.creatorId,
          addedById: user.id,
          url: data.url,
          extractedId,
          type: "Youtube",
          title: snippet.title ?? "Can't find Video Title",
          smallImg:
            (thumbnails.length > 1
              ? thumbnails[thumbnails.length - 2].url
              : thumbnails[0].url) ??
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfW0rOyWkv0OqfwFuljuVldoXEj5VitoWK5w&s",
          bigImg:
            thumbnails[0].url ??
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfW0rOyWkv0OqfwFuljuVldoXEj5VitoWK5w&s",
        },
      });

      return NextResponse.json({
        ...stream,
        haveUpvoted: false,
        upvotes: 0,
      });
    } catch (ytError) {
      console.error("YouTube API Error:", ytError);
      return NextResponse.json(
        { message: "Error fetching video details from YouTube" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(reverbAuthOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 403 }
      );
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 403 }
      );
    }

    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if (!creatorId) {
      return NextResponse.json({ message: "Missing creatorId" }, { status: 400 });
    }

    const [streams, activeStream] = await Promise.all([
      prismaClient.stream.findMany({
        where: {
          userId: creatorId,
          played: false,
        },
        include: {
          _count: {
            select: {
              upvotes: true,
            },
          },
          upvotes: {
            where: {
              userId: user.id,
            },
          },
        },
      }),
      prismaClient.currentStream.findFirst({
        where: {
          userId: creatorId,
        },
        include: {
          stream: true,
        },
      }),
    ]);

    return NextResponse.json({
      streams: streams.map(({ _count, upvotes, ...rest }) => ({
        ...rest,
        upvotes: _count.upvotes,
        haveUpvoted: upvotes.length > 0,
      })),
      activeStream,
    });
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json(
      { message: "Error fetching streams" },
      { status: 500 }
    );
  }
}