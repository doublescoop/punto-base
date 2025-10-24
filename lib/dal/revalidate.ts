'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export default async function revalidate(path?: string, tag?: string) {
  if (path) {
    revalidatePath(path);
  }
  if (tag) {
    revalidateTag(tag);
  }
}

