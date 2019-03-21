const debug = require('debug')('sbo-plugin-template')
import nunjucks from 'nunjucks'

import logger from '../../services/logger'
import Action from "../../model/Action"
import { TemplatePluginOptionsSchema } from '../../schemas/PluginOptionsSchema'
import PluginExecutorInterface from '../PluginExecutorInterface'
import OperatorPlugin from '../OperatorPlugin'

export default class TemplatePlugin extends OperatorPlugin implements PluginExecutorInterface {
  action: Action
  options: any
  preLog: string

  constructor(action: Action, preLog: string) {
    super(action, preLog, TemplatePluginOptionsSchema)
  }

  execute(message: any): Promise<any> {
    debug(
      'Running Template plugin with options: %j and msg: %j',
      this.options,
      message
    )

    const fieldsTemplate = {}
    Object.keys(this.options.fields).forEach((field) => {
      fieldsTemplate[field] = nunjucks.renderString(this.options.fields[field], message)
    })

    const setTemplate = Object.assign({}, message, fieldsTemplate)

    logger.info(this.preLog, 'Template applied')
    return Promise.resolve(setTemplate)
  }
}
