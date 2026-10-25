import { ToastContainer, toast } from 'react-toastify'
import type { IconProps } from 'react-toastify'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type ToastOptions = { autoClose?: number | false | undefined }

export const errorToast = (
  message: React.ReactNode,
  { autoClose }: ToastOptions = { autoClose: 5000 }
) => {
  toast.error(message, { autoClose })
}

export const warningToast = (
  message: React.ReactNode,
  { autoClose }: ToastOptions = { autoClose: 5000 }
) => {
  toast.warning(message, { autoClose })
}

export const successToast = (
  message: React.ReactNode,
  { autoClose }: ToastOptions = { autoClose: 5000 }
) => {
  toast.success(message, { autoClose })
}

export const infoToast = (
  message: React.ReactNode,
  { autoClose }: ToastOptions = { autoClose: 5000 }
) => {
  toast.info(message, { autoClose })
}

// GullyChain kit toasts: bottom-right stack, night surface with a 1px line border and 22px radius
// (styles in tailwind.css), a Lucide icon per state and a cyan progress bar.
function ToastIcon({ type }: IconProps) {
  const props = { size: 20, strokeWidth: 1.75, 'aria-hidden': true }
  switch (type) {
    case 'success':
      return <CheckCircle2 {...props} className="text-gc-cyan" />
    case 'warning':
      return <AlertTriangle {...props} className="text-pending" />
    case 'error':
      return <XCircle {...props} className="text-gc-down" />
    default:
      return <Info {...props} className="text-gc-cyan" />
  }
}

export const Toast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      theme="dark"
      icon={ToastIcon}
    />
  )
}
