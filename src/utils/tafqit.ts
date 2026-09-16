// tafqit.ts - Kuwait Dinar (KWD) Currency Tafqit in Arabic

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TENS = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertGroup(n: number): string {
  let str = '';
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const o = rem % 10;

  if (h > 0) {
    str += HUNDREDS[h];
  }

  if (rem > 0) {
    if (h > 0) str += ' و';
    if (rem >= 10 && rem <= 19) {
      str += TEENS[rem - 10];
    } else {
      if (o > 0) {
        str += ONES[o];
        if (t > 0) str += ' و';
      }
      if (t > 0) {
        str += TENS[t];
      }
    }
  }

  return str;
}

export function tafqitKuwaiti(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'صفر دينار كويتي لا غير';
  
  const absoluteAmount = Math.abs(amount);
  const dinars = Math.floor(absoluteAmount);
  const fils = Math.round((absoluteAmount - dinars) * 1000);

  let dinarText = '';
  if (dinars > 0) {
    const thousands = Math.floor(dinars / 1000);
    const remDinars = dinars % 1000;

    let parts: string[] = [];
    if (thousands > 0) {
      if (thousands === 1) {
        parts.push('ألف');
      } else if (thousands === 2) {
        parts.push('ألفان');
      } else if (thousands >= 3 && thousands <= 10) {
        parts.push(convertGroup(thousands) + ' آلاف');
      } else {
        parts.push(convertGroup(thousands) + ' ألف');
      }
    }

    if (remDinars > 0) {
      parts.push(convertGroup(remDinars));
    }

    dinarText = parts.join(' و');
    if (dinars === 1) {
      dinarText = 'دينار كويتي واحد';
    } else if (dinars === 2) {
      dinarText = 'ديناران كويتيان';
    } else if (dinars >= 3 && dinars <= 10) {
      dinarText += ' دنانير كويتية';
    } else {
      dinarText += ' ديناراً كويتياً';
    }
  }

  let filsText = '';
  if (fils > 0) {
    let fStr = convertGroup(fils);
    if (fils === 1) {
      filsText = 'فلس واحد';
    } else if (fils === 2) {
      filsText = 'فلسان';
    } else if (fils >= 3 && fils <= 10) {
      filsText = fStr + ' فلوس';
    } else {
      filsText = fStr + ' فلساً';
    }
  }

  let result = 'فقط ';
  if (dinarText && filsText) {
    result += `${dinarText} و${filsText} لا غير`;
  } else if (dinarText) {
    result += `${dinarText} لا غير`;
  } else if (filsText) {
    result += `${filsText} لا غير`;
  } else {
    result = 'صفر دينار كويتي لا غير';
  }

  return result;
}
