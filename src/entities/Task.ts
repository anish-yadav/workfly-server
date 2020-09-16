import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,ManyToOne
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  status: string

  @Field()
  @Column()
  creatorId: number

  @Field(() => User,{ nullable: true})
  @ManyToOne( () => User, user => user.tasks)
  creator: User

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  
  @Field(() => Int,{ nullable: true })
  @Column({ nullable: true })
  handlerId: number;

  @Field(() => User,{ nullable: true})
  @ManyToOne(() => User,user => user.myTasks)
  handler: User

  @Field(() => String)
  @CreateDateColumn()
  updatedAt: Date;
}
