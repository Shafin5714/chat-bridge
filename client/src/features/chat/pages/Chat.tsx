import { useState } from "react";

import ChatList from "../components/contacts";
import ChatBody from "../components/chat-body";
import SharedMedia from "../components/shared-media";
import MobileNavigation from "../components/mobile-navigation";

export const Chat = () => {
  const [mobileView, setMobileView] = useState<"contacts" | "chat" | "media">(
    "chat"
  );

  return (
    <div className="bg-gray-100 px-4 py-3 h-full">
      <div className="flex flex-col lg:flex-row h-full gap-4">
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
