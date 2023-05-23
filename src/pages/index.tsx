import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { RouterOutputs, api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errorMsg = err.data?.zodError?.fieldErrors?.content;
      if (errorMsg?.[0]) {
        toast.error(errorMsg?.[0]);
      } else {
        toast.error("Failed to create post");
      }
    }
  });

  const [input, setInput] = useState<string>("");

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <div>
        <Image
          alt="Profile Image"
          className="rounded-full w-12 h-12"
          src={user.profileImageUrl}
          width={48}
          height={48}
        />
      </div>
      <input
        placeholder="Write some posts"
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {
        input !== "" && (
          <button
            disabled={isPosting}
            onClick={() => mutate({ content: input })}
          >
            Post
          </button>
        )
      }
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
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

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>No data available</div>;

  return (
    <div className="flex flex-col">
      {
        (data as PostWithUser[]).map((fullPost, index) => (
          <PostView {...fullPost} key={index} />
        ))
      }
    </div>
  )
}

const Home: NextPage = () => {

  const user = useUser();

  // Catch early and use cached values
  api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full h-full border-slate-400 md:max-w-2xl border-x">
          <div className="border-b border-slate-400 p-4 flex">
            {!user.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {user.isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
