import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import PostView from "~/components/postView";
import generateHelper from "~/server/helpers/trpcServerHelper";

const SinglePost: NextPage<{ id: string }> = ({ id }) => {
    const { data } = api.posts.getById.useQuery({ id });

    if (!data) return <div>404</div>;

    return (
        <>
            <Head>
                <title>{data.post.content} - @{data.author.username}</title>
            </Head>
            <PostView {...data} />
        </>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    const helper = generateHelper();

    const id = context?.params?.id;
    if (typeof id !== "string") throw new Error("Id is not a string");

    await helper.posts.getById.prefetch({ id });

    return {
        props: {
            trpcState: helper.dehydrate(),
            id
        }
    }
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export default SinglePost;
