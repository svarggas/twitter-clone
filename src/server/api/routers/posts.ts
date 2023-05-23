import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
    };
}

// Create a new ratelimiter, that allows 3 requests per 1 min
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * "@upstash/ratelimit"
     */
    prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: {
                createdAt: "desc",
            },
        });

        const users = (
            await clerkClient.users.getUserList({
                userId: posts.map((post) => post.authorId),
                limit: 100,
            })
        ).map((user) => filterUserForClient(user));

        return posts.map((post) => {
            const author = users.find((user) => user.id === post.authorId);

            if (!author || !author.username) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Author not found",
                });
            }

            return { post, author };
        });
    }),

    create: privateProcedure
        .input(
            z.object({
                content: z.string().min(1).max(280),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;
            const { success } = await ratelimit.limit(authorId);
            if (!success) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "You have exceeded your rate limit.",
                });
            }
            const post = await ctx.prisma.post.create({
                data: {
                    content: input.content,
                    authorId,
                },
            });
            return post;
        }),
});
