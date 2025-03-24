import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  mobileView: string;
};

function SharedMedia({ mobileView }: Props) {
  return (
    <Card
      className={`w-full lg:w-80 ${
        mobileView === "media" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader>
        <h2 className="text-xl font-bold">Shared Media</h2>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <img
                src={"https://placehold.co/600x400"}
                alt={`Shared media`}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SharedMedia;
