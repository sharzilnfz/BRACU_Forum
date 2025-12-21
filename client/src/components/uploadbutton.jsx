'use client';

import { Button } from '@/components/ui/stateful-button';
import React from 'react';
import {Sparkles} from 'lucide-react';

export function StatefulButtonDemo() {
  // dummy API call
  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 4000);
    });
  };
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <Button onClick={handleClick}> + New Thread</Button>
    </div>
  );
}
