'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyCommentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage?tab=comments');
  }, [router]);

  return null;
}
