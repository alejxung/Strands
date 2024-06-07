"use server";

import User from "../models/user.model";
import Strand from "../models/strand.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createStrand({
  text,
  author,
  communityId,
  path,
}: Params) {
  connectToDB();

  const createdStrand = await Strand.create({
    text,
    author,
    community: null,
  });

  // Update user model
  await User.findByIdAndUpdate(author, {
    $push: { strands: createdStrand._id },
  });

  revalidatePath(path);
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch the posts that have no parents (top-level strands)
  const postsQuery = Strand.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Strand.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchStrandById(id: string) {
  try {
    // TODO: Populate community
    const strand = await Strand.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Strand,
            populate: {
              path: "author",
              model: User,
              select: ")id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return strand;
  } catch (error: any) {
    throw new Error(`Error fetching strand: ${error.message}`);
  }
}

export async function addCommentToStrand(
  strandId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original strand by its ID
    const originalStrand = await Strand.findById(strandId);

    if (!originalStrand) {
      throw new Error("Strand not found");
    }

    // Create a new strand with the comment text
    const commentStrand = new Strand({
      text: commentText,
      author: userId,
      parentId: strandId,
    });

    // Save the new strand
    const savedCommentStrand = await commentStrand.save();

    // Update the original strand to include the new comment
    originalStrand.children.push(savedCommentStrand._id);

    // Save the original strand
    await originalStrand.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to strand: ${error.message}`);
  }
}
