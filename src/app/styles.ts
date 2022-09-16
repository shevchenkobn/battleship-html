import React from 'react';

export interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function extractStyleProps({ className, style }: StyleProps) {
  return { className, style };
}
