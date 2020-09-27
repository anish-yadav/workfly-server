import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { User } from "../entities/User";

const expo = new Expo();

export const sendNotification = async (department:string) => {
  let messages: ExpoPushMessage[] = [];

  const users = await User.find({where: { bcCity: department }})
  if(!users) return;
  users.forEach((user) => {
    messages.push({
      to: user.pushToken,
      sound: "default",
      body: "New Task Added",
      data: { data: "some data" },
    });
  });
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: ExpoPushTicket[] = [];

  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
};
