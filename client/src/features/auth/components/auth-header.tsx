import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type AuthHeaderProps = {
  title: string;
  description: string;
};

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <CardHeader className="space-y-1 px-4 pt-6 text-center sm:px-6">
      <div className="mb-4 flex justify-center">
        <img
          src="/logo.png"
          alt="Chat Bridge Logo"
          className="h-20 w-auto object-contain drop-shadow-md sm:h-24"
        />
      </div>
      <CardTitle className="text-xl font-bold sm:text-2xl">{title}</CardTitle>
      <CardDescription className="text-sm sm:text-base">
        {description}
      </CardDescription>
    </CardHeader>
  );
}
