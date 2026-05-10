import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "@/store/api/auth-api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { authSlice } from "@/store/slices";

export const registerSchema = z
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

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
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

  return { form, onSubmit, isLoading };
}
