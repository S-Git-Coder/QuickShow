import React from 'react'

/**
 * Reusable loading spinner
 * Props:
 *  - size (number px) default 56 (equivalent to Tailwind h-14 w-14)
 *  - fullScreen (boolean) wraps spinner with fixed vertical space (80vh)
 *  - label (string) accessible text for screen readers
 *  - className (string) extra classes for container
 *  - spinnerClassName (string) extra classes for spinner element
 */
const Loading = ({
  size = 56,
  fullScreen = true,
  label = 'Loading... ',
  className = '',
  spinnerClassName = ''
}) => {
  return (
    <div className={`flex justify-center items-center ${fullScreen ? 'h-[80vh]' : ''} ${className}`.trim()}>
      <div role="status" aria-live="polite" aria-label={label} className="relative flex items-center justify-center">
        <div
          className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${spinnerClassName}`.trim()}
          style={{ width: size, height: size }}
        />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

export default Loading