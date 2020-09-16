import { Task } from "../entities/Task";
import {
  Mutation,
  Query,
  Arg,
  Field,
  InputType,
  Ctx,
  Resolver,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { getConnection } from "typeorm";
import { User } from "../entities/User";

@InputType()
class TaskInput {
  @Field()
  title: string;

  @Field()
  description: string;
}
@Resolver(Task)
export class TaskResolver {
  @FieldResolver(() => User)
  creator(@Root() task: Task, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(task.creatorId);
  }
  @Query(() => [Task])
  async tasks(): Promise<Task[]> {
    return getConnection()
      .getRepository(Task)
      .createQueryBuilder("p")
      .orderBy('p."createdAt"', "DESC")
      .getMany();
  }

  @Mutation(() => Task)
  createTask(
    @Arg("input") task: TaskInput,
    @Ctx() { req }: MyContext
  ): Promise<Task> {
    if (!req.session.userId) throw new Error("not authorized");
    return Task.create({
      ...task,
      creatorId: req.session.userId,
      status: "Open",
    }).save();
  }

  @Mutation(() => Task)
  async editTask(
    @Arg("id") id: number,
    @Arg("description") description: string,
    @Ctx() { req }: MyContext
  ): Promise<Task | undefined> {
    if (!req.session.userId) throw new Error("not authorized");
    const task = await Task.findOne(id)
    if(!task)
      return undefined
    task.description = description
    return task.save()
  }
}
