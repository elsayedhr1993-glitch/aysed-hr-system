# Aysed S HR 2026 - Odoo Enterprise Kuwait Spec

## 1. Business & Legal Rules (Kuwait Private Sector)
- Law Reference: Kuwait Labor Law No. 6 of 2010 (القطاع الخاص).
- Working Days Basis: Fixed at 26 days/month (Day Rate = Gross / 26).
- Working Hours Basis: 8 hours/day (Hour Rate = (Gross / 26) / 8).
- Social Security (PIFSS): Disabled / 0.000 KWD (معفى من التأمينات).
- Overtime Rules:
  * Regular Days: 125% (1.25x).
  * Public Holidays / Rest Days: 200% (2.0x) as per Article 68.
- Currency: KWD (3 decimals formatting: 0.000 د.ك).
- Timezone: Asia/Kuwait (GMT+3).

## 2. Architecture & UI Hierarchy (Odoo Standard)
- Top Navigation Bar (App Switcher):
  * Applications: [HR, Attendance & Leaves, Payroll & Ops, Security, Company Docs].
  * Context: Live Kuwait Time & Active Multi-Company Switcher.
- Sidebar (Parent-Child Dynamic Tree):
  * Automatically switches child routes according to the active top app.
  * Must never repeat root apps inside sub-screens.
- Smart Buttons on Records:
  * Top of record badges for dynamic counts (Contracts, Leaves, Loans, Custodies).
- State & Interaction Requirement:
  * Every table must have functioning Modals, Add/Edit/Delete actions, and instantaneous state sync across components.
  * No placeholder buttons without active onClick / onSubmit handlers.
