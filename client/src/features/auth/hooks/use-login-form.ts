import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "@/store/api/auth-api";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const loginSchema = z.object({
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

export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const { email, password } = values;
    const res = await login({ email, password }).unwrap();
    if (res.success) {
      toast.success(res.message);
      navigate("/");
    }
  };

  return { form, onSubmit, isLoading };
}
