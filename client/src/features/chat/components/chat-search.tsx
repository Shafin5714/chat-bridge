import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { useLazySearchMessagesQuery } from "@/store/api/message-api";

type ChatSearchProps = {
  conversationId: string;
  onJumpToMessage: (messageId: string) => void;
};

export default function ChatSearch({
  conversationId,
  onJumpToMessage,
}: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMessages, { data: searchResults, isFetching: isSearching }] =
    useLazySearchMessagesQuery();

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && conversationId) {
        searchMessages({
          conversationId,
          q: searchQuery,
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, conversationId, searchMessages]);

  return (
    <div className="absolute left-0 right-0 top-16 z-20 border-b bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-900">
      <Input
        autoFocus
        placeholder="Search messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-50 dark:bg-gray-800"
      />
      {searchQuery && (
        <div className="absolute left-0 right-0 top-[100%] max-h-64 overflow-y-auto border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : searchResults?.data && searchResults.data.length > 0 ? (
            searchResults.data.map((msg) => (
              <div
                key={msg._id}
                className="cursor-pointer border-b p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                onClick={() => onJumpToMessage(msg._id)}
              >
                <p className="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">
                  {msg.text}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {moment(msg.createdAt).format("MMM D, YYYY h:mm A")}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No messages found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
