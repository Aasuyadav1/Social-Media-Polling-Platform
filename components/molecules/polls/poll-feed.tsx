"use client"

import { useEffect, useState } from "react"
import { PollCard } from "./poll-card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Loader2 } from "lucide-react"

interface Poll {
  _id: string
  title: string
  options: Array<{
    optionName: string;
    votes: string[];
    _id: string;
    isSelected: boolean;
    voteCount: number;
    percentage: number;
  }>
  image?: string
  graphId: number
  userId: string
  visibility: "public" | "private"
  createdAt: string
  user?: {
    name?: string
    image?: string
  }
}

interface PaginationData {
  current: number
  limit: number
  total: number
  pages: number
}

export function PollFeed() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchPolls = async (page = 1) => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`/api/polls?page=${page}&limit=10`)

      if (page === 1) {
        setPolls(data.data)
      } else {
        setPolls(prev => [...prev, ...data.data])
      }

      setPagination(data.pagination)
    } catch (error) {
      setError("Failed to fetch polls")
      console.error("Error fetching polls:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const loadMore = () => {
    if (pagination && pagination.current < pagination.pages) {
      fetchPolls(pagination.current + 1)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8 py-8">
      {polls.map((poll) => (
        <PollCard key={poll._id} poll={poll} />
      ))}

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {pagination && pagination.current < pagination.pages && !isLoading && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            className="rounded-full"
          >
            Load More
          </Button>
        </div>
      )}

      {polls.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No polls found
        </div>
      )}
    </div>
  )
}
