import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { Post } from '../entities/Post'
import { CreatePostInput } from '../utils/CreatePostInput'
import { MyContext } from '../types'
import { isAuth } from '../middleware/isAuth'
import { getConnection } from 'typeorm'
import { Upvote } from '../entities/Upvote'

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post): string {
    return root.text.length > 50 ? root.text.slice(0, 50) + '...' : root.text
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: MyContext
  ): Promise<PaginatedPosts> {
    const actualLimit = Math.min(50, limit) + 1

    const replacements: unknown[] = [actualLimit, userId]
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    const posts: Post[] = (
      await getConnection().query(
        `
        SELECT COUNT(comment."postId") as "commentsNumber", upvote."value" as "voteStatus", post.id, post."createdAt",
               post."updatedAt", post."text", post."title", post."points", "user".username as "creator_username", "user".id as "creator_id"
        FROM post
                 LEFT JOIN "user" on "user".id = post."creatorId"
                 LEFT JOIN upvote on upvote."postId" = post.id and upvote."userId" = $2 
                 LEFT JOIN comment on comment."postId" = post.id 
            ${cursor ? `WHERE post."createdAt" < $3` : ''}
        GROUP BY post.id, "user".id, upvote.value
        ORDER BY post."createdAt" DESC
        LIMIT $1
    `,
        replacements
      )
    ).map(
      (
        p: Post & {
          creator_username: string
          creator_id: number
          voteStatus: number
          commentsNumber: string
        }
      ) => ({
        ...p,
        commentsNumber: Number(p.commentsNumber),
        creator: {
          username: p.creator_username,
          id: p.creator_id,
        },
      })
    )

    return { posts: posts.slice(0, actualLimit - 1), hasMore: posts.length === actualLimit }
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') { title, text }: CreatePostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = new Post()
    post.title = title
    post.text = text
    post.creatorId = req.session.userId
    return Post.save(post)
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning('*')
      .execute()
    return result.raw[0]
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<boolean> {
    const c = await Post.delete({ id, creatorId: req.session.userId })
    return c.affected ? c.affected > 0 : false
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session

    const existingUpvote = await Upvote.findOne({ where: { postId, userId } })
    if (existingUpvote) {
      if (Math.sign(existingUpvote.value) !== Math.sign(value)) {
        await getConnection().query(`
          START TRANSACTION;
          update upvote set value = ${Math.sign(
            value
          )} where "postId"=${postId} and "userId"=${userId};
          update post set points = points + ${Math.sign(value) * 2} where "id"=${postId};
          COMMIT;
        `)
        return true
      } else {
        return false
      }
    } else {
      await getConnection().query(
        `
        START TRANSACTION;
        insert into upvote ("userId", "postId", value) values (${userId}, ${postId}, ${
          value > 0 ? 1 : -1
        });
        update post set points = points + ${Math.sign(value)} where id = ${postId};
        COMMIT;
      `
      )
      return true
    }
  }
}
