import SvgIcon from '@mui/material/SvgIcon';
import * as React from 'react';

export type SvgProps = Omit<React.ComponentProps<typeof SvgIcon>, 'component' | 'inheritViewBox'>;

export function svgFactory(
  title: string,
  svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
) {
  const component = function component(props: SvgProps) {
    return <SvgIcon component={svg} inheritViewBox {...props} />;
  };
  const nameDescriptor = Object.getOwnPropertyDescriptor(component, 'name');
  Object.defineProperty(component, 'name', {
    ...nameDescriptor,
    value: title,
  });
  return component;
}
