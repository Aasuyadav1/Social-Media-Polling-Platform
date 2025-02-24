"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Dynamically import chart components
const BarChart = dynamic(() => import("@/components/charts/bar-chart"), { ssr: false })
const PieChartComponent = dynamic(() => import("@/components/charts/pie-chart"), { ssr: false })

interface PollOption {
  optionName: string;
  votes: string[];
  _id: string;
  isSelected: boolean;
  voteCount: number;
  percentage: number;
}

interface PollCardProps {
  poll: {
    _id: string;
    title: string;
    options: PollOption[];
    image?: string;
    graphId: number;
    userId: string;
    visibility: "public" | "private";
    createdAt: string;
    votedUsers?: string[];
    user?: {
      name?: string;
      image?: string;
    };
  };
  onVoteSuccess?: () => void;
}

export function PollCard({ poll, onVoteSuccess }: PollCardProps) {
  const { data: session } = useSession();
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 10);
  const [comments] = useState(Math.floor(Math.random() * 20));
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionIndex: number) => {
    if (!session?.user) {
      toast.error("Please sign in to vote");
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      // Optimistically update the UI
      const prevPoll = { ...currentPoll };
      const userId = session.user.id;
      if (!userId) return;

      // Create optimistically updated poll
      const updatedPoll = {
        ...currentPoll,
        options: currentPoll.options.map((option, index) => {
          // If this is the clicked option
          if (index === optionIndex) {
            // If user already voted for this option, remove their vote
            if (option.isSelected) {
              const filteredVotes = option.votes.filter(id => id && id !== userId);
              return {
                ...option,
                isSelected: false,
                votes: filteredVotes,
                voteCount: filteredVotes.length,
              };
            }
            // Add vote to this option
            return {
              ...option,
              isSelected: true,
              votes: [...option.votes.filter(Boolean), userId],
              voteCount: option.votes.filter(Boolean).length + 1,
            };
          }
          // Remove vote from other options
          const filteredVotes = option.votes.filter(id => id && id !== userId);
          return {
            ...option,
            isSelected: false,
            votes: filteredVotes,
            voteCount: filteredVotes.length,
          };
        }),
      };

      // Calculate new percentages
      const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
      updatedPoll.options = updatedPoll.options.map(opt => ({
        ...opt,
        percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
      }));

      // Update UI immediately
      setCurrentPoll(updatedPoll as typeof currentPoll);

      // Make API call
      const response = await fetch(`/api/polls/${currentPoll._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        // Revert changes if API call fails
        setCurrentPoll(prevPoll);
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }

      const { data: serverPoll } = await response.json();
      // Update with server data to ensure consistency
      setCurrentPoll(serverPoll);
      onVoteSuccess?.();

    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const getChartComponent = () => {
    const chartData = {
      labels: currentPoll.options.map(opt => opt.optionName),
      values: currentPoll.options.map(opt => opt.voteCount),
    }

    switch (currentPoll.graphId) {
      case 1:
        return <BarChart data={chartData} />
      case 2:
        return <PieChartComponent data={chartData} />
      default:
        return <BarChart data={chartData} />
    }
  }

  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.voteCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto mb-6 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentPoll.user?.image} />
              <AvatarFallback>{currentPoll.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{currentPoll.user?.name || "Anonymous"}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(currentPoll.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <h4 className="text-xl font-bold leading-tight">{currentPoll.title}</h4>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentPoll.image && (
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <img 
                src={currentPoll.image} 
                alt={currentPoll.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="space-y-4">
            {totalVotes > 0 && (
              <div className="h-[300px] w-full p-4 bg-card rounded-lg border">
                {getChartComponent()}
              </div>
            )}
            
            <div className="space-y-3">
              {currentPoll.options.map((option, index) => (
                <motion.div
                  key={option._id}
                  onClick={() => handleVote(index)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                    option.isSelected ? "bg-orange-100 border-orange-500" : "hover:bg-accent/50",
                    !session && "cursor-not-allowed opacity-80"
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{option.optionName}</span>
                      <span className="text-sm text-muted-foreground">
                        {totalVotes > 0 && `${Math.round(option.percentage)}% (${option.voteCount})`}
                      </span>
                    </div>
                    {totalVotes > 0 && (
                      <div className="absolute left-0 top-0 h-full bg-orange-100/50 rounded-lg transition-all duration-300"
                           style={{ width: `${option.percentage}%`, zIndex: -1 }} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center space-x-2",
                isLiked && "text-red-500"
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span>{likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>{comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
