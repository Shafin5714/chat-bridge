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
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegisterMutation } from "@/store/api/authApi";
import { authSlice } from "@/store/slices";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppDispatch } from "@/store";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required." }).min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().min(1, { message: "Email is required." }).email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, "Password is required.").min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(1, "Password is required.").min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function Register() {
  // hooks
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // apis
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, email, password } = values;
    const res = await registerUser({
      name,
      email,
      password,
    }).unwrap();

    if (res.success) {
      const { id, name, email } = res.data;

      dispatch(
        authSlice.actions.setCredentials({
          id,
          name,
          email,
        }),
      );
      toast.success(res.message);
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-lg sm:shadow-xl">
        <CardHeader className="space-y-1 px-4 pt-6 sm:px-6">
          <CardTitle className="text-xl font-bold sm:text-2xl">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
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
                Create account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-4 pb-6 sm:px-6">
          <div className="text-center text-xs text-muted-foreground sm:text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
