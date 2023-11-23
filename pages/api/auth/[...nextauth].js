import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyPassword } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'thequickbrownfox',
  providers: [
    Credentials({
      async authorize(credentials) {
        const client = await connectToDatabase();

        const usersCollection = client.db().collection('users');

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error('Could not log you in!');
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
  callbacks: {
    // modify the 'user' object returned
    // from the credentials provider above
    async jwt({ user, token }) {
      if (user) {
        token.user = { ...user };
      }
      return token;
    },
    // Modify the 'session' object
    async session({ session, token }) {
      if (token.user) {
        // [FIX] session 'user' object should only have an email
        // field
        session.user = token.user;
        return session;
      }
      // NO JWT -- return null
      return null;
    },
  },
};

export default NextAuth(authOptions);
