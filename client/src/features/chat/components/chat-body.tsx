import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, X, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
} from "@/store/api/messageApi";
import imageCompression from "browser-image-compression";
import { skipToken } from "@reduxjs/toolkit/query";

type Props = {
  mobileView: string;
};

export default function Chat({ mobileView }: Props) {
  // states
  const [text, setText] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const { selectedUser } = useAppSelector((state) => state.user);
  const { messages } = useAppSelector((state) => state.message);
  const { userInfo } = useAppSelector((state) => state.auth);

  // api
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const userId = selectedUser?._id ?? skipToken;
  const { data } = useGetMessagesQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // scroll to bottom
  const msgEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data, messages]);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1, // Max size (in MB) after compression
      maxWidthOrHeight: 1024, // Max width or height
      useWebWorker: true, // Use web workers for faster compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        "Original file size:",
        (file.size / 1024 / 1024).toFixed(2),
        "MB",
      );
      console.log(
        "Compressed file size:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );
      return compressedFile;
    } catch (error) {
      console.error("Compression failed:", error);
      return file; // fallback to original file
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image")) {
      toast.error("Please select an image file.");
      return;
    }

    const compressedFile = await compressImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(compressedFile);
  };

  const handleRemove = (): void => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const res = await sendMessage({
      senderId: userInfo?.id as string,
      text,
      image: imagePreview as string,
    }).unwrap();

    if (res.success) {
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      className={`flex h-full flex-1 flex-col ${
        mobileView === "chat" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader>
        <h1 className="text-2xl font-bold">Chat with {selectedUser?.name}</h1>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea
          className={`h-[calc(100vh-20rem)] ${imagePreview ? "lg:max-h-[calc(100vh-20rem)]" : "lg:h-[calc(100vh-16.5rem)]"}`}
        >
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === userInfo?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === userInfo?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image || "/placeholder.svg"}
                      alt="Shared"
                      className="mb-2 rounded-lg"
                    />
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {message.createdAt}
                  </p>
                </div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col items-end p-2">
        <div className="w-full p-1">
          {imagePreview ? (
            <div className="relative max-h-16 w-16 rounded-sm border border-solid border-gray-400">
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-[-5px] top-[-5px] m-0 h-5 w-5 rounded-xl p-1"
                onClick={handleRemove}
              >
                <X />
              </Button>
              <img src={imagePreview as string} alt="image preview" />
            </div>
          ) : null}
        </div>
        <div className="w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(e);
            }}
            className="flex w-full space-x-2"
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
            />

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Image />
              </Button>
            </div>
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}
