let hideSensitive = false;
let readOnly = false;

export function setImpersonationGate(next: { readOnly: boolean; hideSensitive: boolean }): void {
  readOnly = next.readOnly;
  hideSensitive = next.hideSensitive;
}

export function impersonationWritesBlocked(): boolean {
  return readOnly;
}

export function impersonationHidesSensitive(): boolean {
  return hideSensitive;
}
