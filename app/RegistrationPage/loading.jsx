import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function RegistrationPageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <Skeleton className="h-8 w-40" /> {/* "I want to be a" text */}
          <Skeleton className="h-10 w-[180px]" /> {/* Select dropdown */}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" /> {/* Register button */}
        </div>
      </div>
    </div>
  )
}