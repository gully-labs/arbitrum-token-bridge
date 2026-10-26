import React, { forwardRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

import { Loader, LoaderProps } from './atoms/Loader'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

// GullyChain signature button (kit section 4 + owner rule): pill, min 44px, cyan fill with black text
// (primary), royal blue with white text (secondary), ghost (tertiary); optional left icon, the arrow slides
// on hover, a cyan shine sweeps across on hover (.gc-shine in tailwind.css, off under reduced motion) and
// the button scales to 0.98 while pressed.
function getClassNameForVariant(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'gc-shine-light border-gc-cyan bg-gc-cyan text-black'

    case 'secondary':
      return 'gc-shine border-gc-blue bg-gc-blue text-white'

    case 'tertiary':
      return 'gc-shine border-transparent bg-transparent text-white hover:bg-white/5'
  }
}

type ButtonLoadingProps = Partial<{
  loaderColor: string
  loaderSize: LoaderProps['size']
}>

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant
  loading?: boolean
  loadingProps?: ButtonLoadingProps
  textLeft?: boolean
  showArrow?: boolean
  truncate?: boolean
  /** Left icon (a 20px Lucide icon). */
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      loading,
      loadingProps,
      disabled,
      className: customClassName,
      children,
      icon,
      textLeft,
      showArrow,
      truncate: truncateProp,
      ...props
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false)

    const showLoader = loading || false
    const truncate = truncateProp ?? true

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={twMerge(
          'arb-hover group relative min-h-[44px] w-max overflow-hidden rounded-pill border px-5 py-2 text-sm font-bold',
          'transition-transform duration-200 active:scale-[0.98] motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:border disabled:border-white/10 disabled:bg-white/10 disabled:text-white/50 disabled:active:scale-100',
          getClassNameForVariant(variant),
          showArrow && 'pr-9',
          customClassName
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        <div
          className={twMerge(
            'relative flex flex-row items-center space-x-3',
            textLeft ? 'justify-start' : 'justify-center'
          )}
        >
          {showLoader && (
            <Loader
              color={loadingProps?.loaderColor || 'currentColor'}
              size={loadingProps?.loaderSize || 'small'}
            />
          )}
          {icon && !showLoader && (
            <span className="shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
          )}
          <span className={twMerge(truncate && 'truncate')}>{children}</span>
        </div>
        {showArrow && (
          <ArrowRightIcon
            className={twMerge(
              'absolute right-4 top-[50%] translate-y-[-50%] transition-transform duration-300 motion-reduce:transition-none',
              hovered && 'translate-x-[3px]'
            )}
            width={16}
          />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
