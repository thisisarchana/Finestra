import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8]">
      <div className="w-full max-w-md">
        <Card className="border-[#90e0ef]/20 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#03045e] to-[#0077b6] bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center text-gray-600">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-gray-600">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you can
              sign in and start your journey.
            </p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] text-white font-semibold"
            >
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
