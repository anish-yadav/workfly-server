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
const expo_1 = require("../helpers/expo");
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
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TaskInput.prototype, "department", void 0);
TaskInput = __decorate([
    type_graphql_1.InputType()
], TaskInput);
let PaginatedTask = class PaginatedTask {
};
__decorate([
    type_graphql_1.Field(() => [Task_1.Task]),
    __metadata("design:type", Array)
], PaginatedTask.prototype, "tasks", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedTask.prototype, "hasMore", void 0);
PaginatedTask = __decorate([
    type_graphql_1.ObjectType()
], PaginatedTask);
let Stats = class Stats {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Stats.prototype, "open", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Stats.prototype, "working", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Stats.prototype, "completed", void 0);
Stats = __decorate([
    type_graphql_1.ObjectType()
], Stats);
let TaskResolver = class TaskResolver {
    creator(task, { userLoader }) {
        return userLoader.load(task.creatorId);
    }
    handler(task, { userLoader }) {
        if (task.handlerId === null)
            return null;
        return userLoader.load(task.handlerId);
    }
    async stats() {
        const tasks = await Task_1.Task.find({});
        return {
            completed: tasks.filter(t => t.status === "Completed").length,
            open: tasks.filter(t => t.status === "Open").length,
            working: tasks.filter(t => t.status === "Working").length
        };
    }
    async tasks(limit, cursor, criteria) {
        let MAX_LIMIT = limit ? Math.min(50, limit) : 50;
        if (!cursor)
            cursor = new Date().getTime().toString();
        let query = typeorm_1.getConnection()
            .getRepository(Task_1.Task)
            .createQueryBuilder("p")
            .orderBy('p."createdAt"', "DESC")
            .where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
            .take(MAX_LIMIT);
        if (criteria) {
            query.where('p."createdAt" < :cursor AND p.status = :status', { cursor: new Date(parseInt(cursor)), status: criteria });
        }
        let tasks = await query.getMany();
        return {
            tasks,
            hasMore: tasks.length === MAX_LIMIT,
        };
    }
    async task(id) {
        return Task_1.Task.findOne(id);
    }
    createTask(task, { req }) {
        if (!req.session.userId)
            throw new Error("not authorized");
        expo_1.sendNotification(task.department);
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
    async doTask(taskId, { req }) {
        if (!req.session.userId)
            throw new Error("Not Authorized");
        const task = await Task_1.Task.findOne(taskId);
        if (!task)
            return undefined;
        task.handlerId = req.session.userId;
        task.status = "Working";
        return task.save();
    }
    async updateMany(description) {
        let data = await typeorm_1.getConnection()
            .getRepository(Task_1.Task)
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
};
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Task_1.Task, Object]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Task_1.Task, Object]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "handler", null);
__decorate([
    type_graphql_1.Query(() => Stats),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "stats", null);
__decorate([
    type_graphql_1.Query(() => PaginatedTask),
    __param(0, type_graphql_1.Arg("limit", { nullable: true })),
    __param(1, type_graphql_1.Arg("cursor", { nullable: true })),
    __param(2, type_graphql_1.Arg("criteria", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "tasks", null);
__decorate([
    type_graphql_1.Query(() => Task_1.Task),
    __param(0, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "task", null);
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
__decorate([
    type_graphql_1.Mutation(() => Task_1.Task),
    __param(0, type_graphql_1.Arg("taskId")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "doTask", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("description")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "updateMany", null);
TaskResolver = __decorate([
    type_graphql_1.Resolver(Task_1.Task)
], TaskResolver);
exports.TaskResolver = TaskResolver;
//# sourceMappingURL=task.js.map