import DataLoader from 'dataloader'
import { Upvote } from '../entities/Upvote'

export const createUpvoteLoader = (): DataLoader<
  { postId: number; userId: number },
  Upvote | null,
  { postId: number; userId: number }
> =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(async (keys) => {
    const upvotes = await Upvote.findByIds(keys as any)
    const upvoteIdToUpvote: Record<string, Upvote> = {}
    upvotes.forEach((u) => (upvoteIdToUpvote[`${u.userId}|${u.postId}`] = u))
    return keys.map((k) => upvoteIdToUpvote[`${k.userId}|${k.postId}`])
  })
