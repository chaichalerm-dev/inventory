// Discriminated union returned by every server action so client code
// handles success/failure uniformly instead of try/catching thrown errors.

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok(): ActionResult;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail<T = undefined>(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { ok: false, error, fieldErrors };
}
