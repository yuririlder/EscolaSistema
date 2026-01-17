import { Response } from 'express';
export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}
export interface ErrorResponse {
    success: false;
    error: string;
    details?: any;
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => Response;
export declare const sendNoContent: (res: Response) => Response;
export declare const sendError: (res: Response, error: string, statusCode?: number, details?: any) => Response;
export declare const sendNotFound: (res: Response, resource?: string) => Response;
export declare const sendUnauthorized: (res: Response, message?: string) => Response;
export declare const sendForbidden: (res: Response, message?: string) => Response;
export declare const sendValidationError: (res: Response, errors: any[]) => Response;
export declare const sendServerError: (res: Response, error: Error) => Response;
//# sourceMappingURL=response.d.ts.map