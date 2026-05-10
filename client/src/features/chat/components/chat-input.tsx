import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image, Smile, X, Loader2 } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  // Reset local state when conversation changes
  useEffect(() => {
    setText("");
    setImagePreview(null);
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
    if (!conversationId) return;

    const res = await sendMessage({
      conversationId,
      text,
      image: imagePreview as string,
    }).unwrap();

    if (res.success) {
      handleRemove();
      setText("");
      dispatch(messageSlice.actions.setMessage(res.data));
      onMessageSent();
    }
  };

  return (
    <div className="px-3">
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
          <img
            src={imagePreview as string}
            className="h-10 w-28"
            alt="preview"
          />
        </div>
      ) : null}

      <div className="mt-3 w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(e);
            e.stopPropagation();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            autoFocus
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-12 flex-1 dark:border-gray-800 dark:bg-gray-900"
          />

          <div className="relative">
            {showPicker && (
              <div className="absolute bottom-12 right-0 z-10">
                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              onClick={() => setShowPicker((prev) => !prev)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Image className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-16 shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
