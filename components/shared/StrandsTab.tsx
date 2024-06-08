import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import StrandCard from "../cards/StrandCard";

interface Result {
  name: string;
  image: string;
  id: string;
  strands: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function StrandsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.strands.map((strand) => (
        <StrandCard
          key={strand._id}
          id={strand._id}
          currentUserId={currentUserId}
          parentId={strand.parentId}
          content={strand.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: strand.author.name,
                  image: strand.author.image,
                  id: strand.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : strand.community
          }
          createdAt={strand.createdAt}
          comments={strand.children}
        />
      ))}
    </section>
  );
}

export default StrandsTab;
