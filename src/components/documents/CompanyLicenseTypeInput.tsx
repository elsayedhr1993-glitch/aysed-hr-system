import React from 'react';
import { COMPANY_DOCUMENT_TYPE_SUGGESTIONS } from '../../types/companyDocuments';

interface CompanyLicenseTypeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  listId?: string;
}

/** Free-text license type with optional suggestions (not a fixed enum). */
export const CompanyLicenseTypeInput: React.FC<CompanyLicenseTypeInputProps> = ({
  value,
  onChange,
  className = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-white',
  listId = 'company-license-type-suggestions',
}) => (
  <>
    <input
      type="text"
      list={listId}
      placeholder="اكتب نوع الترخيص (مثال: ترخيص صيدلية، عضوية غرفة تجارة...)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
    <datalist id={listId}>
      {COMPANY_DOCUMENT_TYPE_SUGGESTIONS.map((label) => (
        <option key={label} value={label} />
      ))}
    </datalist>
  </>
);
