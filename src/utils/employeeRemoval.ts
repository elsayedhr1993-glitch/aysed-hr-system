/** Display decision only. Does not delete or recompute anything. */
export function employeeRemovalMode(linkedCount: number): 'archive' | 'delete' {
  return linkedCount > 0 ? 'archive' : 'delete';
}
