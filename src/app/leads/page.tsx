'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/staff-portal/record-leads');
  }, [router]);
  return null;
}
