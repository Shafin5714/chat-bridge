import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  mobileView: string;
};

export default function Contacts({ mobileView }: Props) {
  return (
    <div>
      <Card
        className={`h-full w-full lg:w-80 ${
          mobileView === "contacts" ? "block" : "hidden"
        } lg:block`}
      >
        <CardHeader>
          <h2 className="text-xl font-bold">Contacts</h2>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
            <div className="space-y-4">
              <div className="flex cursor-pointer items-center space-x-4 rounded-lg bg-secondary p-2 transition-colors duration-200 hover:bg-slate-800 hover:text-white">
                <Avatar>
                  <AvatarImage src={""} />
                  <AvatarFallback>{"T"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Test</p>
                  <p className="text-xs text-gray-500">{"Online"}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
