import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";

type Props = {
  mobileView: string;
};

export default function Contacts({ mobileView }: Props) {
  return (
    <div>
      <Card
        className={`w-full lg:w-80 h-full ${
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
              {["John", "Alice"].map((contact) => (
                <HoverCard key={contact}>
                  <HoverCardTrigger asChild>
                    <div
                      className="flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-secondary"
                      //   className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-colors duration-200
                      //       ${
                      //         selectedContact === contact
                      //           ? "bg-primary text-primary-foreground"
                      //           : "hover:bg-secondary"
                      //       }`}
                      //   onClick={() => setSelectedContact(contact)}
                    >
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder-avatar${
                            contact === "Alice" ? "-2" : ""
                          }.jpg`}
                          alt={contact}
                        />
                        <AvatarFallback>{contact[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{contact}</p>
                        <p className="text-xs text-gray-500">
                          {contact === "John" ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder-avatar${
                            contact === "Alice" ? "-2" : ""
                          }.jpg`}
                        />
                        <AvatarFallback>{contact[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{contact}</h4>
                        <p className="text-sm">
                          {contact === "John"
                            ? "Your account"
                            : "Last seen: 2 hours ago"}
                        </p>
                        <div className="flex items-center pt-2">
                          <Button variant="outline" className="text-xs">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
