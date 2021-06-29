import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Comment } from '../entities/Comment'
import { isAuth } from '../middleware/isAuth'
import { MyContext } from '../types'

@Resolver(Comment)
export class CommentResolver {
  @Query(() => [Comment])
  async postComments(@Arg('postId', () => Int) postId: number): Promise<Comment[]> {
    return Comment.find({ where: { postId } })
  }

  @Query(() => [Comment])
  userComments(@Arg('userId', () => Int) userId: number): Promise<Comment[]> {
    return Comment.find({ where: { userId } })
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg('postId', () => Int) postId: number,
    @Arg('text', () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const { userId } = req.session

    const comment = new Comment()
    comment.text = text
    comment.userId = userId
    comment.postId = postId

    return await comment.save()
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async editComment(
    @Arg('commentId', () => Int) commentId: number,
    @Arg('text', () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const { userId } = req.session

    const comment = await Comment.findOne(commentId)

    if (comment?.userId === userId) {
      comment.text = text
      return await comment.save()
    }

    return null
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg('commentId', () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session

    const comment = await Comment.findOne(commentId)

    if (comment?.userId === userId) {
      await comment.remove()
      return true
    }
    return false
  }
}
