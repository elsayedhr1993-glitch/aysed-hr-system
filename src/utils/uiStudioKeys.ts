/** Stable Firestore uiKey prefixes — never rename after publish */
export const UI_KEYS = {
  employeeField: (field: string) => `screen.employees.field.${field}`,
  employeeTab: (tabId: string) => `screen.employees.tab.${tabId}`,
  appTitle: (appId: string) => `screen.${appId}.title`,
  appSubtitle: (appId: string) => `screen.${appId}.subtitle`,
  appSubTab: (appId: string, tabId: string) => `screen.${appId}.subtab.${tabId}`,
  reportNav: (reportId: string) => `reports.nav.${reportId}`,
  templatesContext: (fieldId: string) => `screen.templates.context.${fieldId}`,
} as const;
