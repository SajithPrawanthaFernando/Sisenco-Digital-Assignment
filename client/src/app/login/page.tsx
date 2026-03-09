"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Hexagon,
  AlertCircle,
} from "lucide-react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { useToast } from "@/context/ToastContext";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .required("Password is required."),
});

export default function LoginForm() {
  const container = useRef(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  useGSAP(
    () => {
      gsap.from(".form-container", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".anim-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
      });
    },
    { scope: container },
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      showToast("Welcome back to your dashboard!", "success");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      showToast(
        "Invalid credentials. Please check your email and password.",
        "error",
      );
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={container}
      className="relative min-h-screen flex flex-col bg-[#050505] overflow-hidden"
    >
      <Header />

      <main className="flex-1 flex relative items-center justify-center p-4 py-12 pb-20 w-full">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="form-container w-full max-w-md relative z-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="text-center mb-8 anim-item">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-zinc-400 text-sm">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <div className="space-y-5">
              <div className="anim-item group">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full pl-11 pr-4 py-3.5 bg-black/40 rounded-xl border focus:bg-black/60 outline-none transition-all text-white placeholder:text-zinc-600 shadow-inner ${
                      errors.email
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/5 focus:border-blue-500/50"
                    }`}
                    placeholder="name@company.com"
                  />
                </div>

                {errors.email && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2 font-medium">
                    <AlertCircle size={14} />
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              <div className="anim-item group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    className={`w-full pl-11 pr-4 py-3.5 bg-black/40 rounded-xl border focus:bg-black/60 outline-none transition-all text-white placeholder:text-zinc-600 shadow-inner ${
                      errors.password
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/5 focus:border-blue-500/50"
                    }`}
                    placeholder="••••••••"
                  />
                </div>

                {errors.password && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2 font-medium">
                    <AlertCircle size={14} />
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className=" w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-70 disabled:pointer-events-none mt-2 border border-blue-400/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            <p className="anim-item text-center text-sm text-zinc-500 mt-8">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="text-white font-medium hover:text-blue-400 transition-colors underline underline-offset-4"
              >
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
