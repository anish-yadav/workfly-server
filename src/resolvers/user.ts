import { COOKIE_NAME } from "../constant";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { getVolunteer } from "../zoho";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field({ nullable: true })
  error?: String;

  @Field({ nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async register(@Arg("email") email: string): Promise<Boolean> {
    User.create({ email }).save();
    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<LoginResponse> {
    let user = await User.findOne({ where: { email } });
    if (user && user.password === password) {
      req.session.userId = user.id;
      return {
        user,
      };
    } else if (!user) {
      const volunteer = await getVolunteer(email);
      console.log("Volunter", volunteer);
      if (volunteer == undefined || volunteer.password !== password) {
        return {
          error: "Wrong credential",
        };
      } else {
        let user = await User.create({ ...volunteer }).save();
        req.session.userId = user.id;
        return {
          user: user,
        };
      }
    }
    return {
      error: "Wrong credentials",
    };
  }

  @Mutation(() => Boolean)
  async setPushToken(@Arg("token") token:string, @Ctx() { req }:MyContext):Promise<Boolean> {
    if(!req.session.userId) 
      throw new Error("Not Authorized")
    let user = await User.findOne(req.session.userId)
    if(!user) return false
    user.pushToken = token
    user  = await user.save();
    return user ? true: false;
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    console.log('me in session',req.session.userId)
    if (!req.session.userId) return undefined;

    return getConnection()
      .getRepository(User)
      .createQueryBuilder("u")
      .where("u.id = :id",{ id: req.session.userId})
      .leftJoinAndSelect("u.tasks", "task",'task.creator=u.id')
      .orderBy("task.id","DESC")
      .getOne();
    
  }
}
