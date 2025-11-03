import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store";

type Props = {
  mobileView: string;
};

function SharedMedia({ mobileView }: Props) {
  const { messages } = useAppSelector((state) => state.message);

  const images = messages
    .filter((message) => message.image)
    .map((images) => images.image);

  return (
    <Card
      className={`w-full rounded-none rounded-r-lg lg:w-80 ${
        mobileView === "media" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader className="h-16 px-4 py-4">
        <h2 className="text-xl font-bold">Shared Media</h2>
      </CardHeader>
      <Separator className="mb-4" />
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
              <h2 className="text-gray-600">No Shared Media</h2>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SharedMedia;
