import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { Upvote } from './Upvote'
import { Comment } from './Comment'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => Int, { nullable: true })
  voteStatus: number | null

  @Field()
  @Column()
  title!: string

  @Field()
  @Column()
  text!: string

  @Field()
  @Column({ type: 'int', default: 0 })
  points: number

  @Field()
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  creator: User

  @Field(() => [Upvote], { nullable: true })
  @OneToMany(() => Upvote, (upvote) => upvote.post, { eager: true })
  upvotes: Upvote[]

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post, { eager: true })
  comments: Comment[]

  @Field()
  @Column({ type: 'int' })
  creatorId: number
}
