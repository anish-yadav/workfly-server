"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const User_1 = require("../entities/User");
const expo = new expo_server_sdk_1.Expo();
exports.sendNotification = async (department) => {
    let messages = [];
    const users = await User_1.User.find({ where: { bcCity: department } });
    if (!users)
        return;
    users.forEach((user) => {
        messages.push({
            to: user.pushToken,
            sound: "default",
            body: "New Task Added",
            data: { data: "some data" },
        });
    });
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
        }
        catch (error) {
            console.error(error);
        }
    }
};
//# sourceMappingURL=expo.js.map