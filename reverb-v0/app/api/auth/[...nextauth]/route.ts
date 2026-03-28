import NextAuth from "next-auth";
import { reverbAuthOptions } from "@/app/lib/authOptions";

const handler = NextAuth(reverbAuthOptions);
export { handler as GET, handler as POST };
