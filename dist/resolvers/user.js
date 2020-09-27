"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const constant_1 = require("../constant");
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const zoho_1 = require("../zoho");
const typeorm_1 = require("typeorm");
let LoginResponse = class LoginResponse {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], LoginResponse.prototype, "error", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", User_1.User)
], LoginResponse.prototype, "user", void 0);
LoginResponse = __decorate([
    type_graphql_1.ObjectType()
], LoginResponse);
let UserResolver = class UserResolver {
    async register(email) {
        User_1.User.create({ email }).save();
        return true;
    }
    async login(email, password, { req }) {
        let user = await User_1.User.findOne({ where: { email } });
        if (user && user.password === password) {
            req.session.userId = user.id;
            return {
                user,
            };
        }
        else if (!user) {
            const volunteer = await zoho_1.getVolunteer(email);
            console.log("Volunter", volunteer);
            if (volunteer == undefined || volunteer.password !== password) {
                return {
                    error: "Wrong credential",
                };
            }
            else {
                let user = await User_1.User.create({ ...volunteer }).save();
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
    async setPushToken(token, { req }) {
        if (!req.session.userId)
            throw new Error("Not Authorized");
        let user = await User_1.User.findOne(req.session.userId);
        if (!user)
            return false;
        user.pushToken = token;
        user = await user.save();
        return user ? true : false;
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constant_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
    async me({ req }) {
        console.log('me in session', req.session.userId);
        if (!req.session.userId)
            return undefined;
        return typeorm_1.getConnection()
            .getRepository(User_1.User)
            .createQueryBuilder("u")
            .where("u.id = :id", { id: req.session.userId })
            .leftJoinAndSelect("u.tasks", "task", 'task.creator=u.id')
            .orderBy("task.id", "DESC")
            .getOne();
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => LoginResponse),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("token")), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "setPushToken", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map