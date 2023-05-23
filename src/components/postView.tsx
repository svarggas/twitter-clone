import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

import { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {

    const { post, author } = props;

    return (
        <div
            key={post.id}
            className="flex p-4 border-b border-slate-400 gap-3"
        >
            <Image
                src={author.profileImageUrl}
                alt="Profile Image"
                className="rounded-full w-12 h-12"
                width={48}
                height={48}
            />
            <div className="flex flex-col">
                <div className="flex text-slate-400 gap-2">
                    <Link href={`/@${author.username}`}>
                        <span>{`@${author.username}`}</span>
                    </Link>
                    <Link href={`/post/${post.id}`}>
                        <span className="font-slim">{`${dayjs(post.createdAt).fromNow()}`}</span>
                    </Link>
                </div>
                <span className="text-2xl">{post.content}</span>
            </div>
        </div>
    )
}

export default PostView