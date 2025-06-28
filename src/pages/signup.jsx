import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onRegister = async (data) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: data.fullName,
        phone: data.phone,
        email: user.email,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error.message);
    }
  };

  const onGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName ?? "",
        phone: "",
        email: user.email,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (error) {
      console.error("Google sign-up error:", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onRegister)} className="space-y-4 max-w-sm mx-auto mt-10">
      <input {...register("fullName", { required: "Full name is required" })} placeholder="Full Name" />
      {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}

      <input {...register("phone", { required: "Phone number is required" })} placeholder="Phone Number" />
      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}

      <input {...register("email", { required: "Email is required" })} placeholder="Email" />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

      <input {...register("password", { required: "Password is required" })} type="password" placeholder="Password" />
      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

      <button type="submit">Register</button>
      <button type="button" onClick={onGoogleRegister}>Sign up with Google</button>
    </form>
  );
}