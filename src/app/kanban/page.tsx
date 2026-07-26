'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KanbanRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/staff-portal');
  }, [router]);
  return null;
}
