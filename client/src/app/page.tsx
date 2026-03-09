"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  FileDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";
import Header from "./common/Header";
import Footer from "./common/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.from(".hero-anim", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      gsap.from(".mockup-anim", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        delay: 0.4,
        ease: "power4.out",
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)",
      });

      gsap.from(".value-header", {
        scrollTrigger: {
          trigger: ".value-section",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".value-item", {
        scrollTrigger: {
          trigger: ".value-section",
          start: "top 65%",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      });

      gsap.from(".value-box", {
        scrollTrigger: {
          trigger: ".value-section",
          start: "top 65%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.2)",
      });

      gsap.from(".cta-anim", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="relative min-h-screen flex flex-col items-center bg-[#09090b] text-white overflow-hidden selection:bg-blue-500/30"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <Header />

      <main className="flex flex-col items-center text-center px-6 md:mt-12 w-full max-w-5xl z-10 md:mb-16">
        <div className="hero-anim inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Take control of your financial future
        </div>

        <h1 className="hero-anim text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Track Every Expense. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">
            Achieve Every Goal.
          </span>
        </h1>

        <p className="hero-anim text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
          The ultimate financial dashboard for professionals and agencies.
          Monitor spending, set strict category limits, and export flawless
          reports in seconds.
        </p>

        <div className="hero-anim flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
          >
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 border border-zinc-800"
          >
            View Demo
          </Link>
        </div>
      </main>

      <div className="mockup-anim w-full max-w-5xl px-6 mt-20 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 bottom-0 h-full pointer-events-none" />
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-t-2xl shadow-2xl p-4 sm:p-8 flex flex-col gap-6 h-[400px] overflow-hidden">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="w-32 h-6 bg-zinc-800 rounded-md" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-zinc-800/50 rounded-xl border border-zinc-700/30 p-4">
              <div className="w-16 h-4 bg-zinc-700 rounded mb-4" />
              <div className="w-24 h-8 bg-blue-500/20 rounded" />
            </div>
            <div className="h-24 bg-zinc-800/50 rounded-xl border border-zinc-700/30 p-4">
              <div className="w-20 h-4 bg-zinc-700 rounded mb-4" />
              <div className="w-28 h-8 bg-green-500/20 rounded" />
            </div>
            <div className="h-24 bg-zinc-800/50 rounded-xl border border-zinc-700/30 p-4">
              <div className="w-16 h-4 bg-zinc-700 rounded mb-4" />
              <div className="w-20 h-8 bg-red-500/20 rounded" />
            </div>
          </div>

          <div className="flex-1 bg-zinc-800/30 rounded-xl border border-zinc-700/30 flex items-end p-6 gap-4">
            {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500/20 rounded-t-md hover:bg-blue-500/40 transition-colors"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="features-section w-full max-w-6xl px-6 py-32 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to scale
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Built with precision to handle personal budgets or complex project
            expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Advanced Analytics
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Visualize cash flow trends instantly. Know exactly where your
              money goes with detailed income vs. expense graphs.
            </p>
          </div>

          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PieChart className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Smart Budgets</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Set rigid monthly limits for custom categories. Stay alerted
              before you overspend on software or marketing.
            </p>
          </div>

          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Goal Milestones
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Assign a percentage of your income to dedicated savings targets
              and track your progress to the exact deadline.
            </p>
          </div>

          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileDown className="text-orange-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              1-Click Exports
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Generate pristine PDF and CSV reports for client billing, personal
              records, or tax preparations.
            </p>
          </div>

          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Private & Secure
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your financial data is encrypted and securely stored. We
              prioritize your privacy above all else.
            </p>
          </div>

          <div className="feature-card bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Lightning Fast
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Built on Next.js for a seamless, instant experience. Add
              transactions and view updates without page reloads.
            </p>
          </div>
        </div>
      </section>

      <section className="value-section w-full bg-zinc-900/30 border-y border-zinc-800/50 py-24 z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h2 className="value-header text-3xl md:text-4xl font-bold leading-tight">
              Less time managing spreadsheets. More time building.
            </h2>
            <ul className="space-y-4 overflow-hidden">
              {[
                "Connect your daily expenses instantly.",
                "Assign custom tags and categories.",
                "Watch your wealth grow automatically.",
                "Export data whenever you need it.",
              ].map((step, i) => (
                <li
                  key={i}
                  className="value-item flex items-center gap-3 text-zinc-300"
                >
                  <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="value-box flex-1 w-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl border border-zinc-800 p-4 sm:p-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />

            <div className="w-full h-72 bg-[#09090b] rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden p-6 flex flex-col justify-center">
              {/* Animated Top Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto] animate-gradient" />

              {/* Mockup UI: Transaction Entry */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4">
                    <div className="h-2 w-1/2 bg-zinc-700 rounded" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4">
                      <div className="h-2 w-full bg-blue-500/40 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4">
                      <div className="h-2 w-full bg-zinc-700 rounded" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-12 w-full bg-blue-600 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                    <Zap size={16} fill="white" />
                    <span className="text-sm font-bold">Instant Sync</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-4 right-4 rotate-12 scale-90 sm:scale-100">
                <div className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xl">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                    Verified Secure
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section w-full max-w-4xl mx-auto px-6 py-32 text-center z-10">
        <h2 className="cta-anim text-4xl md:text-5xl font-bold mb-6">
          Ready to streamline your finances?
        </h2>
        <p className="cta-anim text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
          Join professionals who trust ExpenTrack to manage their project
          budgets and personal savings.
        </p>
        <div className="cta-anim">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-xl text-lg"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
