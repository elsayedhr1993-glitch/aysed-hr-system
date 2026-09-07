export interface LeaveBucket {
  id: string;
  year: number;
  grantDate: string;      // YYYY-MM-DD تاريخ نزول الرصيد
  expiryDate: string;     // YYYY-MM-DD تاريخ سقوط الرصيد
  allocatedDays: number;  // إجمالي الأيام الممنوحة
  consumedDays: number;   // الأيام المستهلكة
}

export interface DeductionDetail {
  bucketId: string;
  year: number;
  daysDeducted: number;
}

export interface LeaveCalculationResult {
  success: boolean;
  message?: string;
  totalRequested: number;
  deductions: DeductionDetail[];
  updatedBuckets: LeaveBucket[];
  remainingTotalDays: number;
}

export class KuwaitLeaveEngine {
  /**
   * حساب وخصم الإجازة بنظام FIFO وفق المادة (70) من قانون العمل الكويتي
   */
  public static processFIFOLeave(
    buckets: LeaveBucket[],
    daysRequested: number,
    executionDate: string = new Date().toISOString().split('T')[0]
  ): LeaveCalculationResult {
    if (daysRequested <= 0) {
      return {
        success: false,
        message: 'عدد أيام الإجازة يجب أن يكون أكبر من صفر.',
        totalRequested: daysRequested,
        deductions: [],
        updatedBuckets: buckets,
        remainingTotalDays: this.getAvailableBalance(buckets, executionDate),
      };
    }

    // 1. استخراج وفرز الشحنات الصالحة غير منتهية الصلاحية من الأقدم للأحدث (FIFO)
    const validBuckets = buckets.map(b => ({ ...b }));
    const availablePool = validBuckets
      .filter(b => b.consumedDays < b.allocatedDays && b.expiryDate >= executionDate)
      .sort((a, b) => new Date(a.grantDate).getTime() - new Date(b.grantDate).getTime());

    // حساب إجمالي الرصيد الفعلي المتاح
    const totalAvailable = availablePool.reduce(
      (sum, b) => sum + (b.allocatedDays - b.consumedDays),
      0
    );

    if (daysRequested > totalAvailable) {
      return {
        success: false,
        message: `الرصيد المتاح (${totalAvailable} يوم) لا يكفي لتغطية الإجازة المطلوبة (${daysRequested} يوم).`,
        totalRequested: daysRequested,
        deductions: [],
        updatedBuckets: buckets,
        remainingTotalDays: totalAvailable,
      };
    }

    // 2. تطبيق الخصم بالترتيب (FIFO)
    let remainingToDeduct = daysRequested;
    const deductions: DeductionDetail[] = [];

    for (const bucket of availablePool) {
      if (remainingToDeduct <= 0) break;

      const remainingInBucket = bucket.allocatedDays - bucket.consumedDays;
      const take = Math.min(remainingInBucket, remainingToDeduct);

      bucket.consumedDays += take;
      remainingToDeduct -= take;

      deductions.push({
        bucketId: bucket.id,
        year: bucket.year,
        daysDeducted: take,
      });
    }

    // حساب الرصيد الإجمالي المتبقي بعد العملية
    const remainingTotalDays = validBuckets
      .filter(b => b.expiryDate >= executionDate)
      .reduce((sum, b) => sum + (b.allocatedDays - b.consumedDays), 0);

    return {
      success: true,
      totalRequested: daysRequested,
      deductions,
      updatedBuckets: validBuckets,
      remainingTotalDays,
    };
  }

  /**
   * حساب إجمالي الرصيد الفعلي المتاح حالياً للموظف
   */
  public static getAvailableBalance(
    buckets: LeaveBucket[],
    executionDate: string = new Date().toISOString().split('T')[0]
  ): number {
    return buckets
      .filter(b => b.expiryDate >= executionDate && b.consumedDays < b.allocatedDays)
      .reduce((sum, b) => sum + (b.allocatedDays - b.consumedDays), 0);
  }
}
