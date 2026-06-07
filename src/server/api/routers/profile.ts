import { createTRPCRouter, protectedProcedure, TRPCError } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Server-side Supabase client with service role for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET = 'avatars';

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export const profileRouter = createTRPCRouter({
  // Upload profile photo
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        // base64 encoded image data (already compressed on client)
        imageData: z.string().min(1),
        contentType: z.string().default('image/jpeg'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const supabase = getSupabase();

      // 1. Delete old photo if exists
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      if (currentUser?.image) {
        const urlParts = currentUser.image.split(`${BUCKET}/`);
        if (urlParts.length > 1) {
          const oldPath = urlParts[1];
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      // 2. Upload new photo
      const fileName = `${userId}/profile.jpg`;
      const buffer = Buffer.from(input.imageData, 'base64');

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, buffer, {
          contentType: input.contentType,
          upsert: true,
        });

      if (uploadError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Upload gagal: ${uploadError.message}`,
        });
      }

      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // 4. Update user record
      await prisma.user.update({
        where: { id: userId },
        data: { image: publicUrl },
      });

      return { url: publicUrl };
    }),

  // Delete profile photo
  deletePhoto: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const supabase = getSupabase();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (currentUser?.image) {
      const urlParts = currentUser.image.split(`${BUCKET}/`);
      if (urlParts.length > 1) {
        const oldPath = urlParts[1];
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return { success: true };
  }),

  // Get current profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }),

  // Update profile name
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      return user;
    }),
});
