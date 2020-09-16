import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import 'reflect-metadata'
import cors from 'cors'
import connectRedis from 'connect-redis'
import Redis from 'ioredis'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { Task } from './entities/Task'
import { Token } from './entities/Token'
import { User } from './entities/User'
import { UserResolver, TaskResolver } from './resolvers'
import session from 'express-session'
import { COOKIE_NAME } from './constant'
import { createUserLoader } from './utils/createUserLoader'

const RedisStore = connectRedis(session)
const redis = new Redis()

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        port: 5433,
        host: 'localhost',
        database: 'workfly',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        entities: [User, Token, Task]
    })

    const app = express()

    app.use(cors({
        credentials: true
    }))
    app.use(session({
        name: COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            ttl: 1000*60*60*24*365,
            disableTouch: true
        }),
        saveUninitialized: false,
        secret: 'aadfawdawdawdawda',
        resave: false,
    }))
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, TaskResolver],
            validate: false
        }),
        context: ({ req,res }) => ({ req , res , redis, userLoader: createUserLoader() })
    })

    server.applyMiddleware({ app, cors: false });
    app.listen(4000 , () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath} ${conn.name}`) 
    })

}

main()