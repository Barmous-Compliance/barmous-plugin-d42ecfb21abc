import Image from "next/image";

export type ProductId =
  | "codex"
  | "claude"
  | "cursor"
  | "antigravity"
  | "perplexity"
  | "kimi"
  | "hermes";

const productLogos: Record<ProductId, string> = {
  codex: "/logos/openai.svg",
  claude: "/logos/claude.svg",
  cursor: "/logos/cursor.svg",
  antigravity: "/logos/antigravity.png",
  perplexity: "/logos/perplexity.svg",
  kimi: "/logos/kimi-code.png",
  hermes: "/logos/hermes.png",
};

export default function ProductMark({
  product,
  className,
}: {
  product: ProductId;
  className: string;
}) {
  const logo = productLogos[product];

  return (
    <span
      className={`${className} product-mark product-mark-${product}`}
      aria-hidden="true"
    >
      <Image src={logo} alt="" width={64} height={64} unoptimized />
    </span>
  );
}
