import ConditionalPlugin from './conditional'
import MapperPlugin from './mapper'
import HttpPlugin from './http'
import LogPlugin from './log'
import Prev2TaskPlugin from './prev2task'
import SetterPlugin from './setter'
import TelegramPlugin from './telegram'

export default {
  conditional: ConditionalPlugin,
  mapper: MapperPlugin,
  http: HttpPlugin,
  log: LogPlugin,
  prev2task: Prev2TaskPlugin,
  setter: SetterPlugin,
  telegram: TelegramPlugin,
}
