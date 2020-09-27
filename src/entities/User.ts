import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BaseEntity, OneToMany
} from "typeorm";
import { Task } from "./Task";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  status!: string;

  @Field()
  @Column()
  bcCity: string;

  @Field()
  @Column()
  contact: string;

  @Field()
  @Column()
  zohoID: string

  @Column({ nullable: true })
  pushToken: string

  @Column()
  password!: string;

  @Field(() => [Task],{ nullable: true})
  @OneToMany(() => Task, task => task.creator)
  tasks: Task[]
 
  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, task => task.handler)
  myTasks: Task[]
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt : Date;

  @Field(() => String)
  @CreateDateColumn()
  updatedAt : Date;

}
