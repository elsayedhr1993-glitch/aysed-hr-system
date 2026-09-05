import { safePrintAction } from '../guards/SystemIntegrityGuard';

export const printDocumentA4 = (title: string, contentHtml: string) => {
  const container = document.createElement('div');
  container.className = 'print-area';
  container.innerHTML = `
    <div style="padding: 20px; background: white; color: #0f172a; direction: rtl; text-align: right;">
      <h2 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #714B67;">${title}</h2>
      ${contentHtml}
    </div>
  `;
  document.body.appendChild(container);
  safePrintAction(title);
  setTimeout(() => {
    if (document.body.contains(container)) {
      container.remove();
    }
  }, 1000);
};
