"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Task_1 = require("./entities/Task");
const Token_1 = require("./entities/Token");
const User_1 = require("./entities/User");
const resolvers_1 = require("./resolvers");
const express_session_1 = __importDefault(require("express-session"));
const constant_1 = require("./constant");
const createUserLoader_1 = require("./utils/createUserLoader");
const RedisStore = connect_redis_1.default(express_session_1.default);
const redis = new ioredis_1.default();
const main = async () => {
    const conn = await typeorm_1.createConnection({
        type: 'postgres',
        port: 5433,
        host: 'localhost',
        database: 'workfly',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        entities: [User_1.User, Token_1.Token, Task_1.Task]
    });
    const app = express_1.default();
    app.use(cors_1.default({
        credentials: true
    }));
    app.use(express_session_1.default({
        name: constant_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            ttl: 1000 * 60 * 60 * 24 * 365,
            disableTouch: true
        }),
        saveUninitialized: false,
        secret: 'aadfawdawdawdawda',
        resave: false,
    }));
    const server = new apollo_server_express_1.ApolloServer({
        schema: await type_graphql_1.buildSchema({
            resolvers: [resolvers_1.UserResolver, resolvers_1.TaskResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis, userLoader: createUserLoader_1.createUserLoader() })
    });
    server.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath} ${conn.name}`);
    });
};
main();
//# sourceMappingURL=index.js.map