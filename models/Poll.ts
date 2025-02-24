import mongoose, { Schema, Document } from "mongoose";

export interface IPollOption {
  optionName: string;
  votes: string[];  // Array of user IDs who voted for this option
  percentage?: number; // Virtual field for percentage
}

export interface IPoll extends Document {
  userId: string;
  title: string;
  image?: string;
  options: IPollOption[];
  totalVotes?: number; // Virtual field for total votes
  visibility: "public" | "private";
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  graphId: number;
  votedUsers?: string[]; // Array of all users who voted on this poll
}

const PollSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
    options: [{
      optionName: {
        type: String,
        required: true,
        trim: true,
      },
      votes: [{
        type: String,
        ref: 'User'
      }],
    }],
    votedUsers: [{
      type: String,
      ref: 'User'
    }],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    scheduledFor: {
      type: Date,
      required: false,
    },
    graphId: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate minimum options
PollSchema.path('options').validate(function(options: IPollOption[]) {
  return options.length >= 2;
}, 'Poll must have at least 2 options');

// Create indexes for better query performance
PollSchema.index({ createdAt: -1 });
PollSchema.index({ scheduledFor: 1 });
PollSchema.index({ visibility: 1 });

// Add virtual fields for vote calculations
PollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((sum, option) => sum + option.votes.length, 0);
});

// Calculate percentage for each option
PollSchema.pre('save', function(next) {
  const totalVotes = this.options.reduce((sum, option) => sum + option.votes.length, 0);
  
  // Instead of reassigning the entire array, update each option individually
  this.options.forEach(option => {
    option.set('percentage', totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0);
  });
  
  next();
});

// Method to add or update a vote
PollSchema.methods.addVote = async function(userId: string, optionIndex: number) {
  // Check if user has already voted
  if (this.votedUsers.includes(userId)) {
    // Find and remove the user's previous vote
    this.options.forEach((option: { votes: string[] }) => {
      const voteIndex = option.votes.indexOf(userId);
      if (voteIndex !== -1) {
        option.votes.splice(voteIndex, 1);
      }
    });
  } else {
    // If this is their first vote, add them to votedUsers
    this.votedUsers.push(userId);
  }

  // Add user's new vote to the selected option
  this.options[optionIndex].votes.push(userId);
  
  await this.save();
  return this;
};

// Helper method to get user's current vote
PollSchema.methods.getUserVote = function(userId: string) {
  for (let i = 0; i < this.options.length; i++) {
    if (this.options[i].votes.includes(userId)) {
      return i; // Return the index of the option they voted for
    }
  }
  return null; // Return null if user hasn't voted
};

export default mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);
