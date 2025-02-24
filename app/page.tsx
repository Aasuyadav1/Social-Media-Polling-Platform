"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CreatePollModal } from "@/components/molecules/polls/create-poll-modal"
import { PollFeed } from "@/components/molecules/polls/poll-feed"

export default function Home() {
  return (
    <main className="container max-w-5xl py-4 space-y-4">
      <div className="flex justify-end">
        <CreatePollModal />
      </div>
      <PollFeed />
    </main>
  )
}
