import { Link } from "react-router";
import { MoveLeft, FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error404() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-24 w-24 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl">404</CardTitle>
          <CardDescription className="text-xl">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <MoveLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
