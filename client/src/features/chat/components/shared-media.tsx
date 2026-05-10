import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type Props = {
  mobileView: string;
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

function SharedMedia({ mobileView, setMobileView }: Props) {
  const { messages } = useAppSelector((state) => state.message);

  const images = messages
    .filter((message) => message.image)
    .map((images) => images.image);

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
        <h2 className="text-xl font-bold">Shared Media</h2>
      </CardHeader>
      <Separator className="mb-4 dark:bg-gray-700" />
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-2 gap-4">
            {images.length ? (
              images.map((image) => (
                <div key={image}>
                  <img
                    src={image}
                    alt={`Shared media`}
                    className="h-auto w-full rounded-lg"
                  />
                </div>
              ))
            ) : (
              <h2 className="text-gray-600 dark:text-gray-400">
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
