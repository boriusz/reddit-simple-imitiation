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
import { FindManyOptions, getConnection, LessThan } from 'typeorm'
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

    const options: FindManyOptions = {
      take: actualLimit,
      order: { createdAt: 'DESC' },
    }
    if (cursor) {
      options.where = {
        createdAt: LessThan(new Date(parseInt(cursor))),
      }
    }

    const posts = (await Post.find(options)).map((p) => ({
      ...p,
      voteStatus: p.upvotes.find((uv: Upvote) => uv.userId === userId)?.value ?? null,
    }))

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
