export const calculatePayroll = (employee, org, lopDays = 0, daysInMonth = 30) => {
  // 1. Safe Access to Employee Data
  const salary = employee.employeeDetails?.salary || {};
  const ctc = Number(salary.ctc) || 0;
  const basicPercent = Number(salary.basicPercentage) || 50;

  // 2. Base Earnings Calculation (The theoretical full month)
  const monthlyGross = ctc / 12;
  
  // --- LOP CALCULATION ---
  // Calculate value of one day and multiply by absent/leave days
  const perDaySalary = monthlyGross / daysInMonth;
  const lopAmount = Number((perDaySalary * lopDays).toFixed(2));
  
  // Earned Gross is the actual amount the employee is entitled to for days worked
  const earnedGross = Math.max(0, monthlyGross - lopAmount);
  // -----------------------

  // 3. Components (Calculated on the "Earned" Gross)
  const earnedBasic = earnedGross * (basicPercent / 100);
  
  const statutory = org?.statutoryConfig || {};
  const hraConfig = statutory.hra || {};
  const pfConfig = statutory.pf || {};
  const esiConfig = statutory.esi || {};
  const ptConfig = statutory.professionalTax || {};

  // HRA (Based on Earned Basic)
  const hraPercent = hraConfig.enabled ? (Number(hraConfig.percentageOfBasic) || 40) : 0;
  const earnedHra = earnedBasic * (hraPercent / 100);

  // Special Allowance (Balancing figure to reach earnedGross)
  const earnedSpecialAllowance = Math.max(0, earnedGross - earnedBasic - earnedHra);

  // 4. Deductions Calculation (Based on Earned Basic/Gross)
  
  // PF (Calculated on Earned Basic)
  let pf = 0;
  if (pfConfig.enabled) {
    const pfRate = Number(pfConfig.employeeContribution) || 12;
    pf = earnedBasic * (pfRate / 100);
  }

  // ESI (Calculated on Earned Gross)
  let esi = 0;
  const esiLimit = Number(esiConfig.wageLimit) || 21000;
  if (esiConfig.enabled && earnedGross > 0 && earnedGross <= esiLimit) {
    const esiRate = Number(esiConfig.employeeContribution) || 0.75;
    esi = earnedGross * (esiRate / 100);
  }

  // Professional Tax (PT)
  let professionalTax = 0;
  if (ptConfig.enabled && earnedGross > 0) {
     professionalTax = 200; 
  }
  
  const statutoryDeductions = pf + esi + professionalTax;
  const netPay = earnedGross - statutoryDeductions; 
  
  return {
    earnings: {
      basic: Number(earnedBasic.toFixed(2)),
      hra: Number(earnedHra.toFixed(2)),
      specialAllowance: Number(earnedSpecialAllowance.toFixed(2)),
      gross: Number(earnedGross.toFixed(2)) 
    },
    deductions: {
      pf: Number(pf.toFixed(2)),
      esi: Number(esi.toFixed(2)),
      pt: Number(professionalTax.toFixed(2)),
      lop: lopAmount, 
      total: Number((statutoryDeductions + lopAmount).toFixed(2))
    },
    // Employer Shares (Statutory Snapshot)
    employerContributions: {
      pf: pfConfig.enabled ? earnedBasic * (Number(pfConfig.employerContribution) / 100) : 0,
      esi: (esiConfig.enabled && earnedGross <= esiLimit) ? earnedGross * (Number(esiConfig.employerContribution) / 100) : 0
    },
    gross: Number(earnedGross.toFixed(2)),
    netPay: Number(netPay.toFixed(2)),
    lopDays: lopDays
  };
};