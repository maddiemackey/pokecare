import { type CSSProperties } from "react";

type BackgroundProps = {
	location: string;
	style?: CSSProperties;
	className?: string;
	alt?: string;
};

const FILE_MAP: Record<string, string> = {
	beach: "beach.gif",
	cave: "cave.gif",
	cliffs: "cliffs.gif",
	flowers: "flowers.gif",
	forest: "forest.gif",
	graveyard: "graveyard.gif",
	gym: "gym.jpg",
	hills: "hills.gif",
	lava: "lava.gif",
	ocean: "ocean.gif",
	reef: "reef.gif",
	snow: "snow.gif",
	volcano: "volcano.gif",
	waterfall: "waterfall.gif",
};

export default function Background({ location, style, className, alt }: BackgroundProps) {
	const key = (location || "").toLowerCase().trim().replace(/\s+/g, "");
	const filename = FILE_MAP[key] ?? FILE_MAP[location.toLowerCase().trim()] ?? "forest.gif";

	const src = new URL(`../../../assets/backgrounds/${filename}`, import.meta.url).href;

	return (
		<img
			src={src}
			alt={alt ?? location}
			draggable={false}
			className={className}
			style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
		/>
	);
}
