import { currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Sync Clerk user with database
 * Creates or updates user in database when they sign in
 */
export async function syncUserWithDatabase() {
  try {
    await connectDB();
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return null;
    }

    // Check if user exists
    const existingUser = await User.findOne({ clerkId: clerkUser.id });

    if (existingUser) {
      // Update existing user
      const updated = await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        {
          email,
          name: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : clerkUser.firstName || clerkUser.username || null,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          updatedAt: new Date(),
        },
        { new: true }
      );

      return updated;
    } else {
      // Create new user
      const newUser = await User.create({
        clerkId: clerkUser.id,
        email,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.firstName || clerkUser.username || null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
    return null;
  }
}