import { Field, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Post } from './Post'
import { User } from './User'

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @Column()
  value: string

  @Field()
  @PrimaryColumn()
  userId: number

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  user: User

  @Field()
  @PrimaryColumn()
  postId: number

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post
}
