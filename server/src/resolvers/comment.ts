import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Comment } from '../entities/Comment'
import { isAuth } from '../middleware/isAuth'
import { MyContext } from '../types'
import { Post } from '../entities/Post'
import { User } from '../entities/User'

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

  // @FieldResolver(() => User)
  // async commenter(@Root() comment: Comment): Promise<User | undefined> {
  //   const user = await User.findOne({ where: { id: comment.userId } })
  //   return user
  // }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async comment(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => String) value: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const { userId } = req.session
    console.log(postId)

    const post = await Post.findOne(postId)
    const user = await User.findOne(userId)
    if (!post || !user) {
      return null
    }

    const comment = new Comment()
    comment.value = value
    comment.userId = userId
    comment.post = post
    comment.postId = postId
    comment.user = user

    return await comment.save()
  }
}
