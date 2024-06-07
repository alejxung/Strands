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
