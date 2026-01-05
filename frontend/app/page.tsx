import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Shield, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  // T038: Smart redirect - if user is already logged in, redirect to dashboard
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-1">
            GIAIC Hackathon II - Phase 2
          </Badge>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Manage Your Tasks
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Efficiently
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            A modern, secure task management application built with cutting-edge technology.
            Stay organized, boost productivity, and achieve your goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • Free to use • Secure authentication
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Simple & Intuitive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Clean, modern interface designed for effortless task management.
                Create, update, and organize your tasks with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your data is protected with enterprise-grade authentication using JWT tokens
                and encrypted connections.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Built with Next.js 16 and powered by Neon serverless PostgreSQL
                for optimal performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <Card className="shadow-2xl border-2">
            <CardHeader className="space-y-4 pb-8">
              <CardTitle className="text-3xl font-bold">
                Ready to Get Organized?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of users who are already managing their tasks efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <Link href="/signup" className="block">
                <Button size="lg" className="w-full text-lg py-6 shadow-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="text-base text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            Built with Next.js 16, Better Auth, Neon PostgreSQL, and Shadcn UI
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2025 Todo App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
