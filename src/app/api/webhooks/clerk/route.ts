import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Connect to MongoDB
  await connectDB();

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id }).lean();

      if (!existingUser) {
        // Create new user in database
        await User.create({
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          phone: phone_numbers[0]?.phone_number || null,
          role: (public_metadata?.role as string) || 'user',
        });

        console.log('User created in database:', id);
      }
    } catch (error) {
      console.error('Error creating user in database:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;

    try {
      // Update user in database
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address || '',
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          phone: phone_numbers[0]?.phone_number || null,
          role: (public_metadata?.role as string) || 'user',
          updatedAt: new Date()
        }
      );

      console.log('User updated in database:', id);
    } catch (error) {
      console.error('Error updating user in database:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user from database
      await User.findOneAndDelete({ clerkId: id as string });

      console.log('User deleted from database:', id);
    } catch (error) {
      console.error('Error deleting user from database:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}