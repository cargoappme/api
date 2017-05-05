import 'reflect-metadata'
import {container} from './inversify.config'
import {TYPES} from './types'
import {IApp} from './abstractions/app'

const app = container.get<IApp>(TYPES.App)
app.start()
