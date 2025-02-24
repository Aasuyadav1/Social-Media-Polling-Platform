"use client";
import Link from "next/link";
import Logo from "@/assets/Logo-full.svg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  PlusCircle,
  Settings,
  LogOut,
  User,
  BarChart,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { CreatePollModal } from "@/components/molecules/polls/create-poll-modal";

const Topbar = () => {
  const { data: session } = useSession();

  console.log(session);
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-xl text-primary">
            <Image src={Logo} alt="PollVerse" height={40} />
          </Link>
          <div className="hidden md:flex items-center gap-2 px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search polls..."
              className="w-[300px] bg-muted"
            />
          </div>
        </div>

        {session ? (
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/create">
                <PlusCircle className="h-5 w-5" />
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <CreatePollModal />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <Image width={40} height={40} alt={session?.user?.name as string || "avatar"} src={session.user?.image || ""} />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/polls">
                      <BarChart className="mr-2 h-4 w-4" />
                      My Polls
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        ) : (
          <Button onClick={() => signIn("google")}>Sign In</Button>
        )}
      </div>
    </header>
  );
};

export default Topbar;