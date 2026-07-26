'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Old register route — registration is triggered from `/` when phone is new */
export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
