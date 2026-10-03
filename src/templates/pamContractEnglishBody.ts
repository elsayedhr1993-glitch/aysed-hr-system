/** Default HTML body: PAM civil-sector employment contract (English), Articles 1–16. */
export const PAM_CONTRACT_ENGLISH_BODY = `
<div class="pam-contract-en" style="direction: ltr; text-align: left; font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; color: #0f172a; line-height: 1.45;">
  <div style="text-align: center; margin-bottom: 18px;">
    <div style="font-size: 13pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em;">
      Sample Form of an Employment Contract in the Civil Sector
    </div>
    <div style="margin-top: 10px; font-weight: 700;">State of Kuwait</div>
    <div style="margin-top: 6px;">Public Authority for Manpower / {pam_labour_department}.</div>
    <div>Labour Department.</div>
  </div>

  <p style="margin: 14px 0;">
    On <strong>{contract_weekday}</strong> corresponding to <strong>{contract_date}</strong> the present contract was concluded by and between:
  </p>

  <p style="margin: 10px 0;">
    Company/ institution <strong>{company_name}</strong>.<br />
    represented in signature in the present contract by:<br />
    Name: <strong>{signatory_name}</strong>.<br />
    Civil card <strong>{signatory_civil_id}</strong><br />
    <em>(First party)</em>
  </p>

  <p style="margin: 10px 0;">
    2. Name: <strong>{employee_name}</strong>.<br />
    Nationality <strong>{employee_nationality}</strong><br />
    Civil card <strong>{employee_civil_id}</strong><br />
    Residence: <strong>{employee_residence}</strong>.<br />
    <em>(Second party)</em>
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 16px 0 8px;">Preamble</h3>
  <p style="margin: 0 0 14px;">
    The first party owns the facility entitled <strong>{company_name}</strong> working in the field of <strong>{business_field}</strong>, whereas it wishes to conclude a contract with the second party to work for it in the profession of <strong>{job_title}</strong>, whereas the parties acknowledged their capacity to conclude this contract, they agreed upon the following:
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article One</h3>
  <p style="margin: 0 0 12px;">The preamble above shall constitute an integral part of the present contract.</p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Two — Nature of the Work</h3>
  <p style="margin: 0 0 12px;">
    The first party concluded a contract with the second party to work for it in the profession of <strong>{job_title}</strong> in the State of Kuwait.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Three — Probation Period</h3>
  <p style="margin: 0 0 12px;">
    The second party shall be subject to a probation period for a term not exceeding <strong>{probation_days}</strong> work days. Each party shall have the right to terminate the contract during the said term without notification.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Four — Lease Value</h3>
  <p style="margin: 0 0 12px;">
    For executing the present contract, the second party shall receive the wage of <strong>{salary_amount}</strong> dinars to be paid at the end of every <strong>{pay_period}</strong>. The first party may not decrease the wage during the term of the contract. It may not transfer the second party to daily wage without his approval.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Five — Contract Commencement</h3>
  <p style="margin: 0 0 12px;">
    The contract shall come into force on <strong>{contract_start_date}</strong>. The second party shall execute his work during the entire execution term thereof.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Six — Contract Term</h3>
  <p style="margin: 0 0 8px;">
    The present contract has a definite term. It shall come into force on <strong>{contract_start_date}</strong> for a term of <strong>{contract_term_label}</strong>. The contract may be renewed with the approval of the parties for similar terms not exceeding five years.
  </p>
  <p style="margin: 0 0 8px;">
    The present contract has an indefinite term and it shall come into force on _________.
  </p>
  <p style="margin: 0 0 12px; font-size: 10pt;">
    *Considering the contract as having a definite or indefinite term shall be subject to the will of the two parties.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Seven — Annual Leave</h3>
  <p style="margin: 0 0 12px;">
    The second party shall have the right to a paid annual leave with a term of <strong>{annual_leave_days}</strong> days. It shall not be due on the first year save after the expiration of nine months to be calculated from the date of the contract coming into force.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Eight — Number of Work Hours</h3>
  <p style="margin: 0 0 12px;">
    The first party may not require that the second party work for a term exceeding eight daily work hours with rest periods not less than one hour, except for the cases set forth in the law.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Nine — Ticket Value</h3>
  <p style="margin: 0 0 12px;">
    The first party shall bear the expenses of the return of the second party to his country after the expiration of the work relationship and his final departure from the country.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Ten — Insurance against Injuries and Work Maladies</h3>
  <p style="margin: 0 0 12px;">
    The first party shall insure the second party against injuries and work maladies. It shall also commit to the health insurance value in accordance with the law No. (1) of the year 1999.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Eleven — End of Service Benefit</h3>
  <p style="margin: 0 0 12px;">
    The second party shall be due the end of service benefit as set forth in the regulating laws.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Twelve — Applicable Law</h3>
  <p style="margin: 0 0 12px;">
    The provisions of the Labour code in the civil sector No. 6 of 2010 and the decisions executing the same shall apply for all matters not provided for in the present contract. Shall be considered null every condition agreed upon in violation of the provisions of the law, unless the same has a better benefit for the worker.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Thirteen — Special Conditions</h3>
  <ol style="margin: 0 0 12px; padding-left: 22px;">
    <li>{special_condition_1}</li>
    <li>{special_condition_2}</li>
    <li>{special_condition_3}</li>
  </ol>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Fourteen — Specialized Court</h3>
  <p style="margin: 0 0 12px;">
    The court of first instance and its Labour departments, in accordance with the provisions of the law No. 46 of the year 1987, shall be competent to peruse any conflicts resulting from the execution or interpretation of the present contract.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Fifteen — Contract Language</h3>
  <p style="margin: 0 0 12px;">
    The present contract was made in Arabic and <strong>{secondary_contract_language}</strong>. The Arabic texts shall prevail in the case of any conflict between them.
  </p>

  <h3 style="font-size: 11pt; font-weight: 700; margin: 14px 0 6px;">Article Sixteen — Contract Copies</h3>
  <p style="margin: 0 0 20px;">
    The present contract was made in three copies, one for each party to work in accordance therewith. The third copy shall be deposited at the Public Authority for Manpower.
  </p>

  <table style="width: 100%; margin-top: 28px; border: none;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding-top: 24px;">
        <div style="border-top: 1px solid #334155; width: 85%; padding-top: 6px; font-size: 10pt;">First Party</div>
      </td>
      <td style="width: 50%; vertical-align: top; padding-top: 24px;">
        <div style="border-top: 1px solid #334155; width: 85%; padding-top: 6px; font-size: 10pt;">Second Party</div>
      </td>
    </tr>
  </table>
</div>
`;
