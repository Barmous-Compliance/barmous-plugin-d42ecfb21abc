import Image from "next/image";

export type ProductId = "codex" | "claude";

const productLogos: Record<ProductId, string> = {
  codex: "/logos/openai.svg",
  claude: "/logos/claude.svg",
};

export default function ProductMark({
  product,
  className,
}: {
  product: ProductId;
  className: string;
}) {
  return (
    <span
      className={`${className} product-mark product-mark-${product}`}
      aria-hidden="true"
    >
      <Image
        src={productLogos[product]}
        alt=""
        width={64}
        height={64}
        unoptimized
      />
    </span>
  );
}
