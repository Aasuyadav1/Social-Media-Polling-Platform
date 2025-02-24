import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth } from "@/auth"
import Image from "next/image"

interface UserInfoProps {
  name: string
  username: string
  avatarUrl: string
}

export default async function UserInfo({ name, username, avatarUrl }: UserInfoProps) {
  const session = await auth();
  return (
    <div className="flex items-center space-x-4 p-4 bg-background shadow">
      <Avatar>
        <AvatarImage src={session?.user?.image as string || avatarUrl} alt={name} />
      </Avatar>
      <div>
        <h2 className="font-semibold">{session?.user?.name}</h2>
        <p className="text-sm text-muted-foreground">@{session?.user?.name}</p>
      </div>
    </div>
  )
}

