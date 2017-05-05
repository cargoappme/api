export interface IConfig {
  load (): Promise<void>
  get (): any
}
