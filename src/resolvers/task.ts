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
  ObjectType,
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

@ObjectType()
class PaginatedTask {
  @Field(() => [Task])
  tasks: Task[];

  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(Task)
export class TaskResolver {

  // Returning creator details 
  @FieldResolver(() => User)
  creator(@Root() task: Task, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(task.creatorId);
  }


  // Returning handler details
  @FieldResolver(() => User)
  handler(@Root() task: Task, @Ctx() { userLoader }: MyContext) {
    if (task.handlerId === null) return null;
    return userLoader.load(task.handlerId);
  }


  // Getting tasks
  @Query(() => PaginatedTask)
  async tasks(
    @Arg("limit", { nullable: true }) limit: number,
    @Arg("cursor", { nullable: true }) cursor: string,
    @Arg("criteria", { nullable: true })
    criteria: "Open" | "Working" | "Completed"
  ): Promise<PaginatedTask> {
    let MAX_LIMIT = limit ? Math.min(50, limit) : 50;
    if (!cursor) cursor = new Date().getTime().toString();
    let query = getConnection()
      .getRepository(Task)
      .createQueryBuilder("p")
      .orderBy('p."createdAt"', "DESC")
      .where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
      .take(MAX_LIMIT);

      if(criteria) {
        query.where('p.status = :status',{ status: criteria})
      }
    let tasks = await query.getMany();

    return {
      tasks,
      hasMore: tasks.length === MAX_LIMIT,
    };
  }


  // Getting a task by its id
  @Query(() => Task)
  async task(@Arg("id") id: number): Promise<Task | undefined> {
    return Task.findOne(id);
  }



  // Creating a task
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


  // Editing a task
  @Mutation(() => Task)
  async editTask(
    @Arg("id") id: number,
    @Arg("description") description: string,
    @Ctx() { req }: MyContext
  ): Promise<Task | undefined> {
    if (!req.session.userId) throw new Error("not authorized");
    const task = await Task.findOne(id);
    if (!task) return undefined;
    task.description = description;
    return task.save();
  }


  // Doing a task
  @Mutation(() => Task)
  async doTask(
    @Arg("taskId") taskId: number,
    @Ctx() { req }: MyContext
  ): Promise<Task | undefined> {
    if (!req.session.userId) throw new Error("Not Authorized");
    const task = await Task.findOne(taskId);
    if (!task) return undefined;
    task.handlerId = req.session.userId;
    task.status = "Working";
    return task.save();
  }

  @Mutation(() => Boolean)
  async updateMany(@Arg("description") description: string): Promise<Boolean> {
    let data = await getConnection()
      .getRepository(Task)
      .createQueryBuilder()
      .update()
      .set({ description: description })
      .where("id > 0")
      .execute();
    if (data.affected && data.affected > 0) {
      return true;
    }
    return false;
  }
}
