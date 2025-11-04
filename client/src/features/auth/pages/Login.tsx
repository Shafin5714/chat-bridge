import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginMutation } from "@/store/api/authApi";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required." }).email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(1, {
      message: "Password is required.",
    })
    .min(6, {
      message: "Password must be at least 6 characters.",
    }),
});

export function Login() {
  // hooks
  const navigate = useNavigate();

  // api
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, password } = values;
    const res = await login({ email, password }).unwrap();
    if (res.success) {
      toast.success(res.message);
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-lg sm:shadow-xl">
        <CardHeader className="space-y-1 px-4 pt-6 sm:px-6">
          <CardTitle className="text-xl font-bold sm:text-2xl">Login</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your details below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="dark:bg-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="dark:bg-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className="mt-7 h-10 w-full sm:h-11"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : null}
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-4 pb-6 sm:px-6">
          <div className="text-center text-xs text-muted-foreground sm:text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
