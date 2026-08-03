import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ValidationPipe,
  BadRequestException,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as dotenv from 'dotenv'

@Injectable()
class BigIntResponseInterceptor implements NestInterceptor {
  private sanitize(value: unknown): unknown {
    if (typeof value === 'bigint') {
      return value.toString()
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item))
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, this.sanitize(nestedValue)]),
      )
    }

    return value
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.sanitize(data)))
  }
}

@Injectable()
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
        ? exceptionResponse.message
        : exceptionResponse

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

async function bootstrap() {
  dotenv.config()
  const app = await NestFactory.create(AppModule)
  const port = Number(process.env.PORT || 4000)

  app.useGlobalInterceptors(new BigIntResponseInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors({ origin: true, credentials: true })
  await app.listen(port, '0.0.0.0')
}
bootstrap()
