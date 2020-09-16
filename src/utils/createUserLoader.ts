import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () => new DataLoader<number,User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[])
    const usersMapToId: Record<number,User> = {};
    users.map( u => {
        usersMapToId[u.id] = u
    })
    const sortedUser = userIds.map(id => usersMapToId[id])
    return sortedUser
})