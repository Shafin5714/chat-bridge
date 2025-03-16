import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";

type Props = {
  mobileView: string;
};

function SharedMedia({ mobileView }: Props) {
  return (
    <Card
      className={`w-full lg:w-80 h-full ${
        mobileView === "media" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader>
        <h2 className="text-xl font-bold">Shared Media</h2>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-2 gap-2">
            <img
              src={"/placeholder.svg"}
              alt={`Shared media`}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SharedMedia;
