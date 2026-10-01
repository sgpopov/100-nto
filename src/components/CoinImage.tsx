import Image from "next/image";
import { CoinsIcon } from "lucide-react";

interface CoinImageProps {
  coin: { name: string; images: { url: string }[] };
  className?: string;
}

export const CoinImage = ({ coin, className }: CoinImageProps) => {
  const image = coin.images[0];

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden ${className ?? ""}`}
    >
      {image ? (
        <Image
          alt={`Coin image for ${coin.name}`}
          src={image.url}
          fill
          sizes="128px"
          className="object-cover"
        />
      ) : (
        <div
          data-testid="coin-image-placeholder"
          className="flex size-full items-center justify-center bg-gray-100 text-gray-400"
        >
          <CoinsIcon aria-hidden="true" className="size-1/2" />
        </div>
      )}
    </div>
  );
};
