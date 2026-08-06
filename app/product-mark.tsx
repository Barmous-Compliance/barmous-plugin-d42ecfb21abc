import Image from "next/image";

export type ProductId = "codex" | "claude" | "cursor" | "gemini" | "perplexity";

type ProductLogo = {
  src: string;
  className?: string;
};

const productLogos: Record<ProductId, readonly ProductLogo[]> = {
  codex: [{ src: "/logos/openai.svg" }],
  claude: [{ src: "/logos/claude.svg" }],
  cursor: [{ src: "/logos/cursor.svg" }],
  gemini: [
    { src: "/logos/google-gemini.svg", className: "product-logo-gemini" },
    { src: "/logos/antigravity.png", className: "product-logo-antigravity" },
  ],
  perplexity: [{ src: "/logos/perplexity.svg" }],
};

export default function ProductMark({
  product,
  className,
}: {
  product: ProductId;
  className: string;
}) {
  const logos = productLogos[product];

  return (
    <span
      className={`${className} product-mark product-mark-${product}`}
      aria-hidden="true"
    >
      {logos.length === 1 ? (
        <Image src={logos[0].src} alt="" width={64} height={64} unoptimized />
      ) : (
        <span className="product-mark-pair">
          {logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt=""
              width={64}
              height={64}
              className={logo.className}
              unoptimized
            />
          ))}
        </span>
      )}
    </span>
  );
}
