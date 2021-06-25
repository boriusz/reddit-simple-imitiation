import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { Upvote } from './Upvote'

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
  @ManyToOne(() => User, (user) => user.posts)
  creator: User

  @Field(() => [Upvote], { nullable: true })
  @ManyToOne(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[]

  @Field()
  @Column({ type: 'int' })
  creatorId: number
}
