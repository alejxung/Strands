import StrandCard from "@/components/cards/StrandCard";
import { fetchStrandById } from "@/lib/actions/strand.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const strand = await fetchStrandById(params.id);

  return (
    <section className="relative">
      <div className="">
        <StrandCard
          key={strand._id}
          id={strand._id}
          currentUserId={user?.id || ""}
          parentId={strand.parentId}
          content={strand.text}
          author={strand.author}
          community={strand.community}
          createdAt={strand.createdAt}
          comments={strand.children}
        />
      </div>
    </section>
  );
};

export default Page;
