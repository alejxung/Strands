import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import Comment from "@/components/forms/Comment";
import StrandCard from "@/components/cards/StrandCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchStrandById } from "@/lib/actions/strand.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const strand = await fetchStrandById(params.id);

  return (
    <section className="relative">
      <div>
        <StrandCard
          id={strand._id}
          currentUserId={user.id}
          parentId={strand.parentId}
          content={strand.text}
          author={strand.author}
          community={strand.community}
          createdAt={strand.createdAt}
          comments={strand.children}
        />
      </div>

      <div className="mt-7">
        <Comment
          strandId={params.id}
          currentUserImg={user.imageUrl}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {strand.children.map((childItem: any) => (
          <StrandCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default page;
