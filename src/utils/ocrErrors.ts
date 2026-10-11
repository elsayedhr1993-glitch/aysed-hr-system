export type OcrErrorCode =
  | 'AUTH_REQUIRED'
  | 'NETWORK'
  | 'API_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'PARSE_FAILED'
  | 'EMPTY_RESULT'
  | 'TIMEOUT';

export class OcrScanError extends Error {
  readonly code: OcrErrorCode;
  readonly details?: string;
  readonly httpStatus?: number;
  /** When true, UI should keep the app usable and suggest manual entry */
  readonly manualFallbackSuggested: boolean;

  constructor(
    message: string,
    options: {
      code: OcrErrorCode;
      details?: string;
      httpStatus?: number;
      manualFallbackSuggested?: boolean;
    }
  ) {
    super(message);
    this.name = 'OcrScanError';
    this.code = options.code;
    this.details = options.details;
    this.httpStatus = options.httpStatus;
    this.manualFallbackSuggested = options.manualFallbackSuggested ?? true;
  }
}
