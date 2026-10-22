/* Shared, dependency-free teaching calculations. The browser and Node use the same functions. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IP3ModelMath = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function finite(...values) { if (!values.every(Number.isFinite)) throw new RangeError('Inputs must be finite numbers.'); }
  function trade(t, d, eps) {
    finite(t, d, eps);
    if (t < 0 || d <= -1 || eps <= 0) throw new RangeError('Invalid trade assumptions.');
    const producer = 1 - .6 * d / (1 + d), buyer = (1 + t) * producer, qty = buyer ** -eps;
    return { producer, buyer, qty, usd: producer * qty, local: producer * qty * (1 + d) };
  }
  function flow(x, stress) {
    finite(x.capex, x.benefit, x.opex, x.years, stress);
    if (x.capex <= 0 || !Number.isInteger(x.years) || x.years < 1 || x.years > 100 || stress < 0 || stress > 100) throw new RangeError('Invalid cash-flow assumptions.');
    return [-x.capex, ...Array(x.years).fill(x.benefit * (1 - stress / 100) - x.opex * (1 + stress / 200))];
  }
  function npv(values, rate) {
    finite(rate, ...values);
    if (rate <= -1) throw new RangeError('Discount rate must exceed −100%.');
    return values.reduce((total, value, year) => total + value / (1 + rate) ** year, 0);
  }
  function irr(values) {
    // The page generates conventional flows only. Do not assign one IRR to nonconventional flows.
    finite(...values);
    if (values.length < 2 || values[0] >= 0 || values.slice(1).some(v => v < 0) || !values.slice(1).some(v => v > 0)) return NaN;
    let low = -.9999, high = 3;
    while (npv(values, high) > 0 && high < 1024) high *= 2;
    if (npv(values, low) * npv(values, high) > 0) return NaN;
    for (let i = 0; i < 150; i++) { const mid = (low + high) / 2; if (npv(values, mid) > 0) low = mid; else high = mid; }
    return (low + high) / 2;
  }
  function enterprise(price, cost, prod, elasticity) {
    finite(price, cost, prod, elasticity);
    if (price <= 0 || cost < 0 || prod <= -1 || elasticity <= 0) throw new RangeError('Invalid enterprise assumptions.');
    const units = 1200 * (price / 120) ** -elasticity, effectiveCost = cost / (1 + prod), contribution = price - effectiveCost, fixed = 29000;
    const profit = units * contribution - fixed, revenue = units * price;
    return { units, effectiveCost, contribution, fixed, profit, revenue, margin: 100 * profit / revenue, breakEven: contribution > 0 ? Math.ceil(fixed / contribution) : Infinity };
  }
  function impact(p, q, r, s) {
    finite(p, q, r, s);
    if ([p, q, r, s].some(v => v < 0 || v > 100)) throw new RangeError('Outcomes must be 0–100%.');
    const deltaT = q - p, deltaC = s - r, cf = p + deltaC;
    return { deltaT, deltaC, did: deltaT - deltaC, cf, feasible: cf >= 0 && cf <= 100 };
  }
  function governance(steps, dig, rw, vol) {
    finite(steps, dig, rw, vol);
    if (steps < 0 || steps > 5 || dig < 0 || dig > 1 || rw < 0 || rw > 1 || vol < 0) throw new RangeError('Invalid workload assumptions.');
    const baselineCore = 1.5, baselineRework = .24 * 2.2, baseline = baselineCore + baselineRework;
    const newCore = baselineCore * (1 - .065 * steps) * (1 - .36 * dig), newRework = rw * 2.2, after = newCore + newRework;
    const saved = (baseline - after) * vol * 12;
    return { baselineCore, baselineRework, baseline, newCore, newRework, after, saved, percent: (baseline - after) / baseline * 100, value: saved * 650 };
  }
  function deliveryRate(team, availability, rework, depend) {
    finite(team, availability, rework, depend);
    if (team <= 0 || availability <= 0 || availability > 1 || rework < 0 || depend < 0 || depend >= 1) throw new RangeError('Invalid delivery assumptions.');
    return team * .75 * availability * (1 - depend) / (1 + rework);
  }
  return { trade, flow, npv, irr, enterprise, impact, governance, deliveryRate };
});
