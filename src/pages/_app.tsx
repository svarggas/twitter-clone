import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Little feed</title>
        <meta name="description" content="Little feed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full h-full border-slate-400 md:max-w-2xl border-x overflow-y-scroll">
          <Component {...pageProps} />
        </div>
      </main>
      <Toaster position="top-right" />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
