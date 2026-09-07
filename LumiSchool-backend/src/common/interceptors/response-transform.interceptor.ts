import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface TransformedResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: any;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  TransformedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        // If the response already has the standard shape, pass through
        if (
          responseData &&
          typeof responseData === "object" &&
          "success" in responseData
        ) {
          return responseData;
        }

        return {
          success: true,
          data: responseData,
          message: "Success",
        };
      }),
    );
  }
}
