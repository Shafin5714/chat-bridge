import { useState } from "react";

import ChatList from "../components/contacts";
import ChatBody from "../components/chat-body";
import SharedMedia from "../components/shared-media";
import MobileNavigation from "../components/mobile-navigation";

export const Chat = () => {
  const [mobileView, setMobileView] = useState<"contacts" | "chat" | "media">(
    "chat",
  );

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

        {/* Chat */}
        <ChatBody mobileView={mobileView} />

        {/* Shared Media */}
        <SharedMedia mobileView={mobileView} />
      </div>
    </div>
  );
};
