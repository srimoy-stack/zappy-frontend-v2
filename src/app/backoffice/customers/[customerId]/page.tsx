'use client';

import React from 'react';
import { CustomerProfilePage } from '@/modules/m9/pages';

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { customerId } = React.use(params);
  return <CustomerProfilePage customerId={customerId} />;
}
