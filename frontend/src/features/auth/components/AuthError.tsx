export function AuthError({ message }: { message: string }) {
  return message ? <p role="alert" className="text-sm text-red-700 dark:text-red-300">{message}</p> : null
}
