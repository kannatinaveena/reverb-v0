
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Share2, Play, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Appbar } from "./Appbar";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { YT_REGEX } from "../lib/utils";
import YouTubePlayer from "youtube-player";
import Image from "next/image";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface Video {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  haveUpvoted: boolean;
}

const REFRESH_INTERVAL_MS = 10 * 1000;

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const [inputLink, setInputLink] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreator, setIsCreator] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingNext, setIsPlayingNext] = useState(false); // Flag to prevent conflicts
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playNext = useCallback(async () => {
    if (isPlayingNext) return; // Prevent multiple simultaneous calls
    
    try {
      setIsPlayingNext(true);
      setPlayNextLoader(true);
      
      const data = await fetch(`/api/streams/next`, {
        method: "GET",
      });
      const json = await data.json();
      
      if (json.stream) {
        // Remove the current song from queue first
        setQueue((prevQueue) => {
          const currentVideoId = currentVideo?.id;
          return currentVideoId ? 
            prevQueue.filter((x) => x.id !== currentVideoId) : 
            prevQueue;
        });
        
        // Set the new current video
        setCurrentVideo(json.stream);
      } else {
        // No more songs in queue
        setCurrentVideo(null);
      }
    } catch (e) {
      console.error("Error playing next song:", e);
    } finally {
      setPlayNextLoader(false);
      setIsPlayingNext(false);
    }
  }, [isPlayingNext, currentVideo?.id]);

  const refreshStreams = useCallback(async () => {
    // Don't refresh if we're in the middle of playing next song
    if (isPlayingNext) return;
    
    try {
      const res = await fetch(`/api/streams?creatorId=${creatorId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Refresh streams failed:", res.status);
        throw new Error(`Failed to refresh: ${res.status}`);
      }

      const json = await res.json();
      
      if (json.streams && Array.isArray(json.streams)) {
        setQueue(
          json.streams.length > 0
            ? json.streams.sort((a: Video, b: Video) => b.upvotes - a.upvotes)
            : [],
        );
      } else {
        setQueue([]);
      }

      // Only update current video if it's different or if there's no current video
      setCurrentVideo((prevVideo) => {
        const newActiveStream = json.activeStream?.stream;
        if (!prevVideo && newActiveStream) {
          return newActiveStream;
        }
        if (prevVideo && newActiveStream && prevVideo.id !== newActiveStream.id) {
          return newActiveStream;
        }
        return prevVideo;
      });

      setIsCreator(json.isCreator);

    } catch (error) {
      console.error("Error refreshing streams:", error);
    }
  }, [creatorId, isPlayingNext]);

  useEffect(() => {
    refreshStreams();
    
    const startRefreshInterval = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        refreshStreams();
        startRefreshInterval();
      }, REFRESH_INTERVAL_MS);
    };
    
    startRefreshInterval();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshStreams]);

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo || !playVideo) return;

    let player: ReturnType<typeof YouTubePlayer> | undefined;
    let isDestroyed = false;
    let videoEndHandled = false;

    const initializePlayer = async () => {
      try {
        console.log("Initializing player for:", currentVideo.title);
        
        player = YouTubePlayer(videoPlayerRef.current!);
        await player.loadVideoById(currentVideo.extractedId);
        await player.playVideo();

        const eventHandler = async (event: { data: number }) => {
          if (isDestroyed) return;
          
          // YouTube Player States: 0 = ended, 1 = playing, 2 = paused
          if (event.data === 0 && !videoEndHandled) {
            videoEndHandled = true;
            console.log("Video ended, playing next...");
            
            // Stop the video immediately
            try {
              if (player) {
              await player.stopVideo();
              }
            } catch (error) {
              console.error("Error stopping video:", error);
            }
            
            // Call playNext after a short delay
            setTimeout(() => {
              if (!isDestroyed && !isPlayingNext) {
                playNext();
              }
            }, 300);
          }
        };

        player.on("stateChange", eventHandler);
        
      } catch (error) {
        console.error("Error initializing YouTube player:", error);
      }
    };

    initializePlayer();

    return () => {
      isDestroyed = true;
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    };
  }, [currentVideo?.extractedId, isPlayingNext, playNext, playVideo, currentVideo]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim()) {
      toast.error("YouTube link cannot be empty");
      return;
    }
    if (!inputLink.match(YT_REGEX)) {
      toast.error("Invalid YouTube URL format");
      return;
    }
    setLoading(true);
    try {
      const requestBody = {
        creatorId,
        url: inputLink,
      };

      console.log("Sending request:", requestBody);

      const res = await fetch("/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("Success response:", data);
      
      // Add new song to queue and sort by upvotes
      setQueue((prevQueue) => 
        [...prevQueue, data].sort((a: Video, b: Video) => b.upvotes - a.upvotes)
      );
      setInputLink("");
      toast.success("Song added to queue successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string, isUpvote: boolean) => {

    setQueue((prevQueue) =>
      prevQueue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                haveUpvoted: !video.haveUpvoted,
              }
            : video,
        )
        .sort((a, b) => b.upvotes - a.upvotes),
    );

    try {
      const requestBody = {
        streamId: id,
      };

      const res = await fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        console.error("Vote request failed:", res.status);
        throw new Error(`Vote failed: ${res.status}`);
      }
    } catch (error) {
      console.error("Error voting:", error);

      refreshStreams();
      toast.error("Failed to vote. Please try again.");
    }
  };

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'instagram' | 'clipboard') => {
    const shareableLink = `${window.location.origin}/creator/${creatorId}`;

    if (platform === 'clipboard') {
      navigator.clipboard.writeText(shareableLink).then(() => {
        toast.success('Link copied to clipboard!');
      }).catch((err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy link. Please try again.');
      });
    } else {
      let url;
      switch (platform) {
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(shareableLink)}`;
          break;
        case 'twitter':
          url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}`;
          break;
        case 'instagram':
          navigator.clipboard.writeText(shareableLink);
          toast.success('Link copied for Instagram sharing!');
          return;
        default:
          return;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="pt-20 flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <Appbar />
      <div className='mx-auto text-2xl bg-gradient-to-r rounded-lg from-indigo-600 to-violet-800 font-bold'>
        { }
      </div>
      <div className="flex justify-center px-5 md:px-10 xl:px-20">
        <div className="grid grid-cols-1 gap-y-5 lg:gap-x-5 lg:grid-cols-5 w-screen py-5 lg:py-8">
          <div className="col-span-3 order-2 lg:order-1">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h2 className="text-2xl font-bold text-white mb-2 md:mb-0">
                Upcoming Songs
              </h2>

              <div className="flex space-x-2">
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button onClick={() => setIsOpen(true)} className="bg-purple-700 hover:bg-purple-800 text-white">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-48 sm:max-w-md">
                    <DropdownMenuLabel>Share to Social Media</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-6 w-6 text-green-500" />
                        <span>WhatsApp</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                      <div className="flex items-center space-x-2">
                        <Twitter className="h-6 w-6 text-blue-400" />
                        <span>Twitter</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleShare('clipboard')}>
                      <div className="flex items-center space-x-2">
                        <span>Copy Link to Clipboard</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
              </div>
            </div>
            {queue.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardContent className="p-4 flex flex-col md:flex-row md:space-x-3">
                  <p className="text-center py-8 text-gray-400">
                    No videos in queue
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {queue.map((video) => (
                  <Card
                    key={video.id}
                    className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-4 flex flex-col md:flex-row md:space-x-3">
                      <Image
                        width={160}
                        height={160}
                        src={video.smallImg}
                        alt={`Thumbnail for ${video.title}`}
                        className="md:w-40 mb-5 md:mb-0 object-cover rounded-md"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white text-lg mb-2">
                          {video.title}
                        </h3>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {video.title}
                          </span>
                          <div className="flex items-center space-x-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVote(
                                  video.id,
                                  video.haveUpvoted ? false : true,
                                )
                              }
                              className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                            >
                              {video.haveUpvoted ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                              <span>{video.upvotes}</span>
                            </Button>
                            
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-2 order-1 lg:order-2">
            <div className="space-y-4">
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-white">Add a song</h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Paste YouTube link here"
                      value={inputLink}
                      onChange={(e) => setInputLink(e.target.value)}
                      className="bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    />
                    <Button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      {loading ? "Loading..." : "Add to Queue"}
                    </Button>
                  </form>
                  {inputLink && inputLink.match(YT_REGEX) && !loading && (
                    <div className="mt-4">
                      <LiteYouTubeEmbed
                        title=""
                        id={inputLink.split("?v=")[1]}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                  {currentVideo ? (
                    <div>
                      {playVideo ? (
                        <div
                          ref={videoPlayerRef}
                          className="w-full aspect-video"
                        />
                      ) : (
                        <>
                          <Image
                            src={currentVideo.bigImg}
                            width={480}
                            height={270}
                            className="w-full aspect-video object-cover rounded-md"
                            alt={currentVideo.title}
                          />
                          <p className="mt-2 text-center font-semibold text-white">
                            {currentVideo.title}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-400">
                      No video playing
                    </p>
                  )}
                  {playVideo && (
                    <Button
                      disabled={playNextLoader}
                      onClick={playNext}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      <Play className="mr-2 h-4 w-4" />{" "}
                      {playNextLoader ? "Loading..." : "Play next"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}