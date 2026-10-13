export interface ActionCheck {
  readonly ok: boolean;
  readonly reasons: readonly string[];
}

export function actionCheck(reasons: readonly string[]): ActionCheck {
  return { ok: reasons.length === 0, reasons };
}
