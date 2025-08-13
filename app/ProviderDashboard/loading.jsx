import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProviderDashboardLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 bg-background border-b p-4 flex justify-between items-center">
        <Skeleton className="h-8 w-48" /> {/* Title skeleton */}
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar skeleton */}
      </header>

      {/* Main Content with Tabs Skeleton */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="justify-start border-b px-4">
            <TabsTrigger value="home" disabled>Home</TabsTrigger>
            <TabsTrigger value="download" disabled>Download</TabsTrigger>
            <TabsTrigger value="seed" disabled>Seed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Graph Area Skeleton */}
            <div className="flex-1 relative p-4">
              <Skeleton className="h-full w-full" />
            </div>

            {/* Side Panel Skeleton */}
            <div className="w-80 border-l flex flex-col bg-background">
              {/* Side Panel Header Skeleton */}
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              
              {/* Scrollable Graph List Skeleton */}
              <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}