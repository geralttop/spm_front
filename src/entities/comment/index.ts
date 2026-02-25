export type {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from "@/shared/api/comments";

export {
  createCommentSchema,
  updateCommentSchema,
} from "@/shared/schemas/comment.schema";

export type {
  CreateCommentInput,
  UpdateCommentInput,
} from "@/shared/schemas/comment.schema";

export { Comments } from "@/widgets/Comments";

