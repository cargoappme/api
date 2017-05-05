import {IDatabase} from './database'

export type IDatabaseProvider = () => Promise<IDatabase>
