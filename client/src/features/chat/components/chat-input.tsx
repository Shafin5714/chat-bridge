import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, X, Loader2, FileIcon } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { useSendMessageMutation } from "@/store/api/message-api";
import { useAppDispatch } from "@/store";
import { messageSlice } from "@/store/slices";

type ChatInputProps = {
  conversationId?: string;
  onTyping: (text: string) => void;
  onMessageSent: () => void;
};

export default function ChatInput({
  conversationId,
  onTyping,
  onMessageSent,
}: ChatInputProps) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    data: string | ArrayBuffer | null;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  // Reset local state when conversation changes
  useEffect(() => {
    setText("");
    setAttachmentPreview(null);
    setShowPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [conversationId]);

  // Report typing back to parent for typing indicators
  useEffect(() => {
    onTyping(text);
  }, [text, onTyping]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression failed:", error);
      return file;
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error("File size cannot exceed 10MB.");
      return;
    }

    let fileToProcess = file;
    if (file.type.startsWith("image")) {
      fileToProcess = await compressImage(file);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview({
        data: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(fileToProcess);
  };

  const handleRemove = (): void => {
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !attachmentPreview) return;
    if (!conversationId) return;

    let payload: any = { conversationId };

    if (text.trim()) {
      payload.text = text.trim();
    }

    if (attachmentPreview) {
      if (attachmentPreview.type.startsWith("image")) {
        payload.image = attachmentPreview.data as string;
      } else {
        payload.attachment = {
          data: attachmentPreview.data as string,
          name: attachmentPreview.name,
          type: attachmentPreview.type,
          size: attachmentPreview.size,
        };
      }
    }

    const res = await sendMessage(payload).unwrap();

    if (res.success) {
      handleRemove();
      setText("");
      dispatch(messageSlice.actions.setMessage(res.data));
      onMessageSent();
    }
  };

  return (
    <div className="px-3">
      {attachmentPreview ? (
        <div className="relative mb-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2 pr-8 dark:border-gray-800 dark:bg-gray-900 w-fit">
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-[-8px] top-[-8px] m-0 h-5 w-5 rounded-full p-1 shadow-md"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
          
          {attachmentPreview.type.startsWith("image") ? (
            <img
              src={attachmentPreview.data as string}
              className="h-16 w-auto rounded-sm object-cover"
              alt="preview"
            />
          ) : (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="rounded-md bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FileIcon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="max-w-[150px] truncate text-sm font-medium dark:text-gray-200">
                  {attachmentPreview.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(attachmentPreview.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="mb-4 w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(e);
            e.stopPropagation();
          }}
          className="flex w-full items-center gap-2"
        >
          {/* Main Input Pill */}
          <div className="flex flex-1 items-center rounded-full border border-gray-200 bg-white pr-2 dark:border-gray-800 dark:bg-gray-900 transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20">
            <Input
              type="text"
              autoFocus
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-12 flex-1 border-0 bg-transparent px-5 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {/* Icons inside the pill */}
            <div className="flex items-center gap-1">
              <div className="relative">
                {showPicker && (
                  <div className="absolute bottom-14 right-0 z-10">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={() => setShowPicker((prev) => !prev)}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={isLoading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 -ml-1 mt-1" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
