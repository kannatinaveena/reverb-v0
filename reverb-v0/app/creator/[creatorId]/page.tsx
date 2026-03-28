import StreamView from "@/app/components/StreamView";

type CreatorPageProps = {
  params: Promise<{
    creatorId: string;
  }>;
};

export default async function Creator({ params }: CreatorPageProps) {
  const { creatorId } = await params;
  
  return (
    <div>
      <StreamView creatorId={creatorId} playVideo={false} />
    </div>
  );
}