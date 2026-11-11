export function RequestError({ message, onRetry }: { message: string | null; onRetry?: () => void }) {
  if (!message) return null
  return <div className="request-error" role="alert">
    <p>{message}</p>
    {onRetry && <button type="button" onClick={onRetry}>Повторить</button>}
  </div>
}
