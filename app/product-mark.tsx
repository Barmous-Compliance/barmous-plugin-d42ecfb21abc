import Image from "next/image";

export type ProductId = "codex" | "claude" | "cursor" | "gemini" | "perplexity";

const productLogos: Partial<Record<ProductId, string>> = {
  codex: "/logos/openai.svg",
  claude: "/logos/claude.svg",
};

function ConnectorGlyph({ product }: { product: Exclude<ProductId, "codex" | "claude"> }) {
  if (product === "cursor") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 4 12 8-6 2-2 6L6 4Z" />
      </svg>
    );
  }

  if (product === "gemini") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3c.7 5.2 3.8 8.3 9 9-5.2.7-8.3 3.8-9 9-.7-5.2-3.8-8.3-9-9 5.2-.7 8.3-3.8 9-9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5v-7Z" />
      <path d="m8.5 10.5 3.5 2 3.5-2M12 12.5V17" />
    </svg>
  );
}

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
      {logo ? (
        <Image src={logo} alt="" width={64} height={64} unoptimized />
      ) : (
        <ConnectorGlyph product={product as Exclude<ProductId, "codex" | "claude">} />
      )}
    </span>
  );
}
