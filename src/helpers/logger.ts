import * as logtail from '@logtail/node'
import env from '@/helpers/env'

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Numeric values for log levels (higher value = higher priority)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 4,
  [LogLevel.WARN]: 3,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 1,
}

// Type for metadata objects
type LogMetadata = Record<string, unknown>

// Logging transport interface
interface LogTransport {
  error(message: string, meta: LogMetadata): Promise<unknown> | void
  warn(message: string, meta: LogMetadata): Promise<unknown> | void
  info(message: string, meta: LogMetadata): Promise<unknown> | void
  debug(message: string, meta: LogMetadata): Promise<unknown> | void
  getMinLevel(): LogLevel
}

// Base transport class with log level filtering
abstract class BaseTransport implements LogTransport {
  protected minLevel: LogLevel

  constructor(minLevel: LogLevel = LogLevel.DEBUG) {
    this.minLevel = minLevel
  }

  // Check if a level should be logged based on minimum level
  protected shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  getMinLevel(): LogLevel {
    return this.minLevel
  }

  abstract error(message: string, meta: LogMetadata): Promise<unknown> | void
  abstract warn(message: string, meta: LogMetadata): Promise<unknown> | void
  abstract info(message: string, meta: LogMetadata): Promise<unknown> | void
  abstract debug(message: string, meta: LogMetadata): Promise<unknown> | void
}

// Transport for console logging
class ConsoleTransport extends BaseTransport {
  error(message: string, meta: LogMetadata) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(message, meta)
    }
  }

  warn(message: string, meta: LogMetadata) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(message, meta)
    }
  }

  info(message: string, meta: LogMetadata) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(message, meta)
    }
  }

  debug(message: string, meta: LogMetadata) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(message, meta)
    }
  }
}

// Transport for BetterStack logging
class BetterStackTransport extends BaseTransport {
  private client!: logtail.Logtail
  private isEnabled = true
  private errorLogged = false

  constructor(
    sourceToken: string,
    ingestingHost?: string,
    minLevel: LogLevel = LogLevel.INFO
  ) {
    super(minLevel)

    try {
      // Configure BetterStack client with ingestingHost if provided
      const options: Record<string, unknown> = {}

      if (ingestingHost) {
        options.endpoint = `https://${ingestingHost}`
      }

      this.client = new logtail.Logtail(sourceToken, options)
    } catch (error) {
      console.error('Failed to initialize BetterStack client:', error)
      this.isEnabled = false
    }
  }

  private handleError(error: Error | unknown) {
    if (!this.errorLogged) {
      console.error('BetterStack logging error:', error)
      this.errorLogged = true

      // Disable transport after error to prevent further errors
      this.isEnabled = false
    }
  }

  error(message: string, meta: LogMetadata) {
    if (!this.isEnabled || !this.shouldLog(LogLevel.ERROR)) return
    try {
      return this.client.error(message, meta)
    } catch (error) {
      this.handleError(error)
    }
  }

  warn(message: string, meta: LogMetadata) {
    if (!this.isEnabled || !this.shouldLog(LogLevel.WARN)) return
    try {
      return this.client.warn(message, meta)
    } catch (error) {
      this.handleError(error)
    }
  }

  info(message: string, meta: LogMetadata) {
    if (!this.isEnabled || !this.shouldLog(LogLevel.INFO)) return
    try {
      return this.client.info(message, meta)
    } catch (error) {
      this.handleError(error)
    }
  }

  debug(message: string, meta: LogMetadata) {
    if (!this.isEnabled || !this.shouldLog(LogLevel.DEBUG)) return
    try {
      return this.client.debug(message, meta)
    } catch (error) {
      this.handleError(error)
    }
  }
}

class Logger {
  private context: LogMetadata = {}
  private transports: LogTransport[] = []

  constructor() {
    // Add console transport by default that logs everything
    this.addTransport(new ConsoleTransport(LogLevel.DEBUG))
  }

  // Add new transport
  addTransport(transport: LogTransport) {
    this.transports.push(transport)
    return this
  }

  // Set context that will be added to all logs
  setContext(context: LogMetadata) {
    this.context = { ...this.context, ...context }
    return this
  }

  // Clear context
  clearContext() {
    this.context = {}
    return this
  }

  // Log with ERROR level
  error(message: string, meta: LogMetadata = {}) {
    const combinedMeta = { ...this.context, ...meta }
    this.transports.forEach((transport) =>
      transport.error(message, combinedMeta)
    )
    return this
  }

  // Log with WARN level
  warn(message: string, meta: LogMetadata = {}) {
    const combinedMeta = { ...this.context, ...meta }
    this.transports.forEach((transport) =>
      transport.warn(message, combinedMeta)
    )
    return this
  }

  // Log with INFO level
  info(message: string, meta: LogMetadata = {}) {
    const combinedMeta = { ...this.context, ...meta }
    this.transports.forEach((transport) =>
      transport.info(message, combinedMeta)
    )
    return this
  }

  // Log with DEBUG level
  debug(message: string, meta: LogMetadata = {}) {
    const combinedMeta = { ...this.context, ...meta }
    this.transports.forEach((transport) =>
      transport.debug(message, combinedMeta)
    )
    return this
  }

  // Method for compatibility with console.log
  log(message: string, meta: LogMetadata = {}) {
    return this.info(message, meta)
  }
}

// Export logger singleton
export const logger = new Logger()

// Initialize logger
export function initLogger() {
  // Add BetterStack transport if token is available
  if (env.BETTERSTACK_SOURCE_TOKEN) {
    try {
      // Configure BetterStack to only send INFO and higher logs
      const betterStackTransport = new BetterStackTransport(
        env.BETTERSTACK_SOURCE_TOKEN,
        env.BETTERSTACK_INGESTING_HOST,
        LogLevel.INFO // Only send INFO, WARN, ERROR to BetterStack
      )

      logger.addTransport(betterStackTransport)
      logger.info('BetterStack logger initialized', {
        ingestingHost: env.BETTERSTACK_INGESTING_HOST,
        minLevel: LogLevel.INFO,
      })
    } catch (error) {
      console.error('Failed to initialize BetterStack transport:', error)
    }
  } else {
    console.warn(
      'BETTERSTACK_SOURCE_TOKEN not provided, BetterStack logging disabled'
    )
  }

  // Set global context
  logger.setContext({
    environment: env.NODE_ENV,
    application: env.APP_NAME,
  })

  return logger
}
