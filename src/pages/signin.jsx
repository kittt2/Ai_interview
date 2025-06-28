import { useForm } from "react-hook-form";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "../../firebase/client"; // Adjust if needed
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onEmailLogin = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("User logged in:", userCredential.user);
      navigate("/"); // redirect after successful login
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  const onGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google login successful:", result.user);
      navigate("/"); // redirect after login
    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onEmailLogin)}
      className="space-y-4 max-w-sm mx-auto mt-10"
    >
      <Input
        {...register("email", { required: "Email is required" })}
        placeholder="Email"
      />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}

      <Input
        {...register("password", { required: "Password is required" })}
        type="password"
        placeholder="Password"
      />
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}

      <Button type="submit">Login with Email</Button>
      <Button type="button" onClick={onGoogleLogin} variant="outline">
        login in with Google
      </Button>
    </form>
  );
}