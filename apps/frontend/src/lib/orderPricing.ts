/**
 * Shared order pricing helpers.
 *
 * Business (mayorista) users see prices WITHOUT IVA. The stored
 * `order_lines.unit_price` is therefore ex-IVA and the IVA must be added
 * separately to obtain the real total.
 *
 * Non-business users see prices WITH IVA included, so `unit_price` is
 * IVA-inclusive and the subtotal must be derived by removing the IVA.
 */

const DEFAULT_IVA_PERCENT = 21;

export interface OrderBreakdownLine {
  unit_price: string | number;
  quantity: number;
  product_iva?: number | null;
}

export interface OrderBreakdown {
  subtotal: number;
  iva: number;
  total: number;
}

/** Normalises an iva value coming as decimal (0.21) or percent (21). */
export function normalizeIvaPercent(
  iva: number | null | undefined,
  fallback: number = DEFAULT_IVA_PERCENT,
): number {
  if (iva == null || Number.isNaN(Number(iva))) return fallback;
  const value = Number(iva);
  if (value <= 0) return fallback;
  return value < 1 ? value * 100 : value;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Computes the subtotal (ex-IVA), total IVA and grand total (IVA included)
 * for an order, regardless of whether the owner is a business user.
 *
 * For business users the result is computed bottom-up from the lines and
 * always overrides any stored total_amount. For non-business users the
 * stored total is treated as IVA-inclusive and split by line.
 */
export function computeOrderBreakdown(params: {
  orderLines: OrderBreakdownLine[];
  userIsBusiness: boolean;
}): OrderBreakdown {
  const { orderLines, userIsBusiness } = params;

  let subtotal = 0;
  let iva = 0;

  if (userIsBusiness) {
    for (const line of orderLines) {
      const lineSubtotal = Number(line.unit_price) * line.quantity;
      const ivaPct = normalizeIvaPercent(line.product_iva);
      subtotal += lineSubtotal;
      iva += lineSubtotal * (ivaPct / 100);
    }
  } else {
    for (const line of orderLines) {
      const lineTotal = Number(line.unit_price) * line.quantity;
      const ivaPct = normalizeIvaPercent(line.product_iva);
      const lineSubtotal = lineTotal / (1 + ivaPct / 100);
      const lineIva = lineTotal - lineSubtotal;
      subtotal += lineSubtotal;
      iva += lineIva;
    }
  }

  subtotal = round2(subtotal);
  iva = round2(iva);
  const total = round2(subtotal + iva);

  return { subtotal, iva, total };
}
