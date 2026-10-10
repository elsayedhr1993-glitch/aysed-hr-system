import type { DepartmentConfig, FolderConfig } from '../types/governmentLicense';

export const GOVERNMENT_COMPLIANCE_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'MOH',
    name: 'وزارة الصحة',
    code: 'MOH',
    icon: '🏥',
    color: 'emerald',
    folders: [
      { id: 'moh_facility', name: 'تراخيص المنشأة الصحية', icon: '🏢', description: 'ترخيص المركز، الأشعة، المختبر، الصيدلية' },
      { id: 'moh_profession', name: 'تراخيص مزاولة المهنة', icon: '🩺', description: 'تراخيص الأطباء والتمريض والفنيين' },
      { id: 'moh_ads', name: 'تراخيص الإعلانات الصحية', icon: '📢', description: 'موافقات الترويج وإعلانات وسائل التواصل' },
    ],
  },
  {
    id: 'PAM',
    name: 'الهيئة العامة للقوى العاملة',
    code: 'PAM',
    icon: '👥',
    color: 'blue',
    folders: [
      { id: 'pam_company', name: 'ملف المنشأة واعتماد التوقيع', icon: '📜', description: 'شهادة اعتماد التوقيع والبيانات الأساسية' },
      { id: 'pam_permits', name: 'أذونات العمل وتصاريح العمل', icon: '🪪', description: 'أذونات عمل الموظفين المسجلين' },
      { id: 'pam_mandate', name: 'هويات وبطاقات المناديب', icon: '👔', description: 'تفاويض وبطاقات هوية المراجعين والمناديب' },
      { id: 'pam_quota', name: 'النسبة الوطنية والتفتيش', icon: '📊', description: 'شهادات استيفاء نسب العمالة الوطنية ومحاضر التفتيش' },
    ],
  },
  {
    id: 'KFF',
    name: 'قوة الإطفاء العام',
    code: 'KFF',
    icon: '🚒',
    color: 'rose',
    folders: [
      { id: 'kff_safety', name: 'رخص الإطفاء والسلامة', icon: '🛡️', description: 'رخص الحريق ومعدات السلامة للمنشأة' },
    ],
  },
  {
    id: 'BALADIYA',
    name: 'بلدية الكويت',
    code: 'Municipality',
    icon: '🏛️',
    color: 'amber',
    folders: [
      { id: 'baladiya_license', name: 'رخصة البلدية والإعلانات', icon: '🏷️', description: 'الرخصة الصحية ورخص الإعلانات الخارجية واللافتات' },
    ],
  },
  {
    id: 'MOI_TRAFFIC',
    name: 'الخدمات العامة والمرور',
    code: 'MoI',
    icon: '🚗',
    color: 'indigo',
    folders: [
      { id: 'moi_vehicles', name: 'دفاتر وتأمين المركبات', icon: '🚘', description: 'دفاتر ملكية سيارات المنشأة وبوالص التأمين الإجباري' },
    ],
  },
];

export function findDepartmentFolder(
  departmentId: string,
  folderId: string
): { department?: DepartmentConfig; folder?: FolderConfig } {
  const department = GOVERNMENT_COMPLIANCE_DEPARTMENTS.find((d) => d.id === departmentId);
  const folder = department?.folders.find((f) => f.id === folderId);
  return { department, folder };
}
