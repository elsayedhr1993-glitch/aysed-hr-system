import { Employee } from '../types';

/** مصدر حقيقة لتاريخ التعيين: تاريخ المباشرة المعتمد في CommencementApp */
export function applyApprovedCommencementToEmployee(
  emp: Partial<Employee> & Record<string, any>,
  actualJoiningDate: string,
  extra: Partial<Employee> & Record<string, any> = {}
): Partial<Employee> & Record<string, any> {
  const date = String(actualJoiningDate || '').slice(0, 10);
  return {
    ...emp,
    ...extra,
    joinDate: date,
    hireDate: date,
    commencementDate: date,
  };
}
