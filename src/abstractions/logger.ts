export interface ILogger {
  log (text: string): void
  info (text: string): void
  warn (text: string): void
  error (text: string): void
}
