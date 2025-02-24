"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X, ImagePlus, Globe2, Lock, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import axios from "axios"
import { GRAPH_TYPES, DEFAULT_GRAPH_ID } from "@/constants/graph-types"
import { cn } from "@/lib/utils"

interface PollOption {
  optionName: string;
  value: number;
}

export function CreatePollModal() {
  const [pollOptions, setPollOptions] = useState<PollOption[]>([{ optionName: "", value: 0 }, { optionName: "", value: 0 }])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [visibility, setVisibility] = useState("public")
  const [graphId, setGraphId] = useState(DEFAULT_GRAPH_ID)
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { optionName: "", value: 0 }])
    }
  }

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index)
      setPollOptions(newOptions)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePoll = async () => {
    try {
      if (!title.trim()) {
        toast.error("Please enter a poll question")
        return
      }

      const validOptions = pollOptions
        .filter(opt => opt.optionName.trim())
        .map(opt => ({
          optionName: opt.optionName.trim(),
          value: 0
        }))

      if (validOptions.length < 2) {
        toast.error("Please add at least 2 valid options")
        return
      }

      setIsLoading(true)

      const { data } = await axios.post("/api/polls", {
        title: title.trim(),
        options: validOptions,
        image: selectedImage,
        visibility,
        graphId,
      })
      
      toast.success("Poll created successfully")

      // Reset form
      setTitle("")
      setPollOptions([{ optionName: "", value: 0 }, { optionName: "", value: 0 }])
      setSelectedImage(null)
      setVisibility("public")
      setOpen(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to create poll")
      } else {
        toast.error("Failed to create poll")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-full hover:scale-105 transition-transform duration-200">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-2xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold">Create New Poll</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Poll Question</Label>
              <Input
                id="title"
                placeholder="What's your favorite programming language?"
                className="rounded-lg border-input/60 focus:border-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Poll Image (Optional)</Label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              {selectedImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-input/60">
                  <img
                    src={selectedImage}
                    alt="Poll image"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl bg-muted/50 hover:bg-muted border-muted-foreground/20 hover:border-muted-foreground/30 transition-colors flex items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Add Image</span>
                </Button>
              )}
            </div>

            {/* Poll Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Poll Options</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.optionName}
                      onChange={(e) => {
                        const newOptions = [...pollOptions]
                        newOptions[index].optionName = e.target.value
                        setPollOptions(newOptions)
                      }}
                      className="rounded-lg pr-8 border-input/60 focus:border-primary"
                    />
                    {index >= 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {pollOptions.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full rounded-lg border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-primary hover:text-primary/80"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>

            {/* Graph Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Visualization</Label>
              <RadioGroup
                value={graphId.toString()}
                onValueChange={(value) => setGraphId(Number(value))}
                className="grid grid-cols-2 gap-4"
              >
                {GRAPH_TYPES.map((graph) => (
                  <Label
                    key={graph.id}
                    htmlFor={`graph-${graph.id}`}
                    className={cn(
                      "cursor-pointer space-y-2 rounded-xl border-2 p-4 hover:border-primary/50 transition-colors",
                      graphId === graph.id ? "border-primary bg-primary/5" : "border-muted"
                    )}
                  >
                    <RadioGroupItem
                      value={graph.id.toString()}
                      id={`graph-${graph.id}`}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <graph.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{graph.name}</span>
                      </div>
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2",
                        graphId === graph.id 
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted"
                      )}>
                        {graphId === graph.id && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-2 text-center">
                      <div className="h-24 flex items-center justify-center">
                        <graph.icon className="h-16 w-16 text-muted-foreground/40" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {graph.description}
                    </p>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-full rounded-lg border-input/60 h-10 cursor-pointer hover:bg-accent transition-colors focus:ring-1 focus:ring-primary">
                  <div className="flex items-center gap-2">
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-input/60">
                  <SelectItem 
                    value="public" 
                    className="cursor-pointer focus:bg-accent hover:bg-accent transition-colors rounded-md"
                  >
                    <div className="flex items-center gap-2 py-1 group">
                      <Globe2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="group-hover:text-primary transition-colors">Public</span>
                      <span className="text-xs text-muted-foreground ml-2 group-hover:text-primary/70 transition-colors">
                        (Visible to everyone)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="private" 
                    className="cursor-pointer focus:bg-accent hover:bg-accent transition-colors rounded-md"
                  >
                    <div className="flex items-center gap-2 py-1 group">
                      <Lock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="group-hover:text-primary transition-colors">Private</span>
                      <span className="text-xs text-muted-foreground ml-2 group-hover:text-primary/70 transition-colors">
                        (Only visible to you)
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-6 shrink-0">
          <Button
            type="submit"
            className="rounded-full w-full sm:w-auto hover:scale-105 transition-transform duration-200"
            onClick={handleCreatePoll}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Poll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
