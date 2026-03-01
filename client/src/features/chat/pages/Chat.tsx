import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAppSelector } from "@/store";

import ChatList from "../components/contacts";
import ChatBody from "../components/chat-body";
import SharedMedia from "../components/shared-media";
import MobileNavigation from "../components/mobile-navigation";

export const Chat = () => {
  const [mobileView, setMobileView] = useState<"contacts" | "chat" | "media">(
    "chat",
  );

  const { selectedUser } = useAppSelector((state) => state.user);

  return (
    <div className="h-full bg-gray-200 px-4 py-3 dark:bg-gray-700">
      <div className="flex h-full flex-col gap-3 dark:border-gray-700 lg:flex-row lg:gap-0">
        {/* Mobile Navigation */}
        <MobileNavigation
          mobileView={mobileView}
          setMobileView={setMobileView}
        />

        {/* Contacts */}
        <ChatList mobileView={mobileView} />

        {selectedUser ? (
          <>
            {/* Chat */}
            <ChatBody mobileView={mobileView} />

            {/* Shared Media */}
            <SharedMedia mobileView={mobileView} />
          </>
        ) : (
          <div
            className={`${
              mobileView === "contacts" ? "hidden" : "flex"
            } flex-1 flex-col items-center justify-center rounded-r-lg border-y border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-[#1e2532] lg:flex`}
          >
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <MessageSquare className="h-20 w-20 text-gray-400" />
              <h2 className="text-center text-2xl font-semibold text-gray-700 dark:text-gray-300">
                Welcome to Chat Bridge
              </h2>
              <p className="px-4 text-center text-gray-500 dark:text-gray-400">
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
