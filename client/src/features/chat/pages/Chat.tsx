import { useState } from "react";

import Contacts from "../components/Contacts";
import ChatBody from "../components/ChatBody";
import SharedMedia from "../components/SharedMedia";
import MobileNavigation from "../components/MobileNAvigation";

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
        <Contacts mobileView={mobileView} />

        {/* Chat */}
        <ChatBody mobileView={mobileView} />

        {/* Shared Media */}
        <SharedMedia mobileView={mobileView} />
      </div>
    </div>
  );
};
