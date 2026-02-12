export * from "@/app/actions/pricing";

export function calculateREEPremium(
  basePrice: number,
  metadata: { reeContent?: Array<{ name: string; percentage?: number }> } | null | undefined
): number {
  // Logic to adjust price based on REE yield estimates from AI
  let premium = 1.0;

  if (metadata?.reeContent) {
    metadata.reeContent.forEach((item) => {
      const pct = Number(item.percentage ?? 0);
      if (item.name.includes("Gold") && pct > 10) premium += 0.15;
      if (item.name.includes("Neodymium")) premium += 0.20;
    });
  }

  return basePrice * premium;
}
