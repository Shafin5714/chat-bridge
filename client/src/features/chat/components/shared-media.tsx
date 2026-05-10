import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileIcon, Download } from "lucide-react";
import { downloadFile } from "@/lib/utils";

type Props = {
  mobileView: string;
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

function SharedMedia({ mobileView, setMobileView }: Props) {
  const { messages } = useAppSelector((state) => state.message);

  const mediaItems = messages.filter((message) => message.image || message.attachment);

  return (
    <Card
      className={`w-full rounded-none rounded-r-lg lg:w-96 ${
        mobileView === "media" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader className="flex flex-row items-center h-16 px-4 py-4 space-y-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileView("chat")}
          className="lg:hidden -ml-2 mr-2 text-gray-500"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold">Shared Media & Files</h2>
      </CardHeader>
      <Separator className="mb-4 dark:bg-gray-700" />
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {mediaItems.length ? (
              mediaItems.map((message) => {
                if (message.image || message.attachment?.type.startsWith("image")) {
                  return (
                    <div key={message._id}>
                      <img
                        src={message.image || message.attachment?.url}
                        alt={`Shared media`}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </div>
                  );
                } else if (message.attachment?.type.startsWith("video")) {
                  return (
                    <div key={message._id}>
                      <video
                        src={message.attachment.url}
                        className="h-auto w-full rounded-lg"
                      />
                    </div>
                  );
                } else if (message.attachment) {
                  return (
                    <button
                      key={message._id}
                      onClick={() => downloadFile(message.attachment!.url, message.attachment!.name)}
                      className="col-span-2 flex items-center gap-3 rounded-lg border p-3 border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    >
                      <div className="rounded-md bg-white p-2 dark:bg-gray-800">
                        <FileIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1 text-left">
                        <span className="truncate text-sm font-medium">
                          {message.attachment.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(message.attachment.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Download className="h-4 w-4 shrink-0 text-gray-500" />
                    </button>
                  );
                }
                return null;
              })
            ) : (
              <h2 className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                No Shared Media
              </h2>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SharedMedia;
