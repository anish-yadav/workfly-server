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
exports.TaskResolver = void 0;
const Task_1 = require("../entities/Task");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
let TaskInput = class TaskInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TaskInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TaskInput.prototype, "description", void 0);
TaskInput = __decorate([
    type_graphql_1.InputType()
], TaskInput);
let TaskResolver = class TaskResolver {
    creator(task, { userLoader }) {
        return userLoader.load(task.creatorId);
    }
    async tasks() {
        return typeorm_1.getConnection()
            .getRepository(Task_1.Task)
            .createQueryBuilder("p")
            .orderBy('p."createdAt"', "DESC")
            .getMany();
    }
    createTask(task, { req }) {
        if (!req.session.userId)
            throw new Error("not authorized");
        return Task_1.Task.create({
            ...task,
            creatorId: req.session.userId,
            status: "Open",
        }).save();
    }
    async editTask(id, description, { req }) {
        if (!req.session.userId)
            throw new Error("not authorized");
        const task = await Task_1.Task.findOne(id);
        if (!task)
            return undefined;
        task.description = description;
        return task.save();
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Task_1.Task, Object]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.Query(() => [Task_1.Task]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "tasks", null);
__decorate([
    type_graphql_1.Mutation(() => Task_1.Task),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createTask", null);
__decorate([
    type_graphql_1.Mutation(() => Task_1.Task),
    __param(0, type_graphql_1.Arg("id")),
    __param(1, type_graphql_1.Arg("description")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "editTask", null);
TaskResolver = __decorate([
    type_graphql_1.Resolver(Task_1.Task)
], TaskResolver);
exports.TaskResolver = TaskResolver;
//# sourceMappingURL=task.js.map