import type { User } from "@clerk/nextjs/dist/server";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
    };
}

export default filterUserForClient;