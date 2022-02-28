import * as tsnode from 'ts-node'
import { start } from './cli'

tsnode.register()

start().catch(console.error)
