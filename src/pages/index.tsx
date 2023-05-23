import { type NextPage } from "next";
import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import PostView, { PostWithUser } from "~/components/postView";

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
      <div className="border-b border-slate-400 p-4 flex">
        {!user.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
        {user.isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </>
  );
};

export default Home;
