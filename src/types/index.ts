import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "src/utils/createUserLoader";

export type MyContext = {
  req: Request & { session: Express.Session };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>
};