import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import React, { useState } from "react";
import { LoaderContext, LoaderContextProps } from "./context/LoaderContext";
import Loader from "./components/Loader";
import { Toaster } from "react-hot-toast";
import { ConversationContext, ConversationContextProps } from "./context/ConversationContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loaderIsVisible, setLoaderIsVisible] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [conversationId, setConversationId] = useState(''); //'aa1366a7-7f08-413f-94e8-445f71047ec2');

  return (
    <React.StrictMode>
      <NextUIProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <LoaderContext.Provider
            value={
              new LoaderContextProps(
                loaderIsVisible,
                setLoaderIsVisible,
                setLoaderMessage
              )
            }
          >
            <ConversationContext.Provider value={new ConversationContextProps(conversationId, setConversationId)}>
              <main className="w-full h-full bg-gray-200 dark:bg-black">
                <Toaster position="bottom-left" reverseOrder={false} />
                {children}
              </main>
              {loaderIsVisible && <Loader message={loaderMessage} />}
            </ConversationContext.Provider>
          </LoaderContext.Provider>
        </ThemeProvider>
      </NextUIProvider>
    </React.StrictMode>
  );
}
