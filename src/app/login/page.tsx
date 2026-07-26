'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Old login route — auth now lives at `/` */
export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
