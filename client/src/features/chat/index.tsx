import { useState } from "react";

import Contacts from "./components/contacts";
import ChatBody from "./components/chat";
import SharedMedia from "./components/shared-media";
import MobileNavigation from "./components/mobile-navigation";

export default function Chat() {
  const [mobileView, setMobileView] = useState<"contacts" | "chat" | "media">(
    "chat"
  );

  return (
    <div className="h-screen bg-gray-100 p-4">
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
}
