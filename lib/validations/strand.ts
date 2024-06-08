import * as z from "zod";

export const StrandValidation = z.object({
  strand: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  strand: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});
