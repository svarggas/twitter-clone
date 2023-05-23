import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import PostView from "~/components/postView";
import generateHelper from "~/server/helpers/trpcServerHelper";

const ProfileFeed = (props: { userId: string }) => {
    const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });

    if (isLoading) return <LoadingPage />;
    if (!data || !data.length) return null;

    return (
        <div className="flex flex-col">
            {
                data.map((fullPost, index) => (
                    <PostView {...fullPost} key={index} />
                ))
            }
        </div>
    )
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
    const { data } = api.profile.getUserByUsername.useQuery({ username });

    if (!data) return <div>404</div>;

    return (
        <>
            <Head>
                <title>{data.username}</title>
            </Head>
            <div className="relative h-48 bg-slate-600">
                <Image
                    alt="Profile Image"
                    className="-mb-[64px] bottom-0 left-0 absolute ml-4 rounded-full border-black bg-black"
                    src={data.profileImageUrl}
                    width={128}
                    height={128}
                />
            </div>
            <div className="h-[64px]" />
            <div className="p-4 text-2xl font-bold">@{username}</div>
            <div className="w-full border-h border-slate-400" />
            <ProfileFeed userId={data.id} />
        </>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    const helper = generateHelper();

    const slug = context?.params?.slug;
    if (typeof slug !== "string") throw new Error("Slug is not a string");

    const username = slug.replace("@", "");
    await helper.profile.getUserByUsername.prefetch({ username });

    return {
        props: {
            trpcState: helper.dehydrate(),
            username
        }
    }
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export default ProfilePage;
