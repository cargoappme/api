import {IScout} from '../abstractions/scout'

export interface IApp {
  start (): void
  use (scout: IScout): IApp
}
