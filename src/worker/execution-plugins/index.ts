import ConditionalPlugin from './conditional'
import MapperPlugin from './mapper'
import HttpPlugin from './http'
import LogPlugin from './log'
import Prev2TaskPlugin from './prev2task'
import SetterPlugin from './setter'
import TelegramPlugin from './telegram'
import MergerPlugin from './merger'
import TemplatePlugin from './template'

export default {
  conditional: ConditionalPlugin,
  mapper: MapperPlugin,
  http: HttpPlugin,
  log: LogPlugin,
  prev2task: Prev2TaskPlugin,
  setter: SetterPlugin,
  telegram: TelegramPlugin,
  merger: MergerPlugin,
  template: TemplatePlugin
}
