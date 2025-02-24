import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDB } from "@/lib/db-connect";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials({
    //   async authorize(credentials) {
    //     try {
    //       await connectToDB();
          
    //       const user = await User.findOne({ email: credentials.email });
          
    //       if (!user) return null;
          
    //       const isValid = await bcrypt.compare(
    //         credentials.password as string,
    //         user.password
    //       );
          
    //       if (!isValid) return null;
          
    //       return {
    //         id: user._id.toString(),
    //         email: user.email,
    //         name: `${user.firstName} ${user.lastName}`.trim(),
    //         image: user.profileImage,
    //       };
    //     } catch (error) {
    //       console.error("Auth error:", error);
    //       return null;
    //     }
    //   }
    // })
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectToDB();
        const sessionUser = await User.findOne({ email: session?.user?.email });
        if (session?.user) {
          session.user.id = sessionUser?._id.toString();
          // by default they contains email, name and image with additional id
        }
        return session;
      } catch (error) {
        console.error(error);
        return session;
      }
    },
    async signIn({ profile }) {
      try {
        
        const email = profile?.email;
        if (!email) return false;
        await connectToDB();
        let user = await User.findOne({ email: email });
        if (!user) {
          user = await User.create({
            email: profile?.email,
            name: profile?.given_name?.replace(" ", "").toLowerCase(),
            image: profile?.picture
          });
        }
        return true;
      } catch (error) {
        console.error(error); 
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
