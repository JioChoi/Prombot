

function InfoItem(title, value) {
    return (
        <div className="">
            <p className="text-zinc-50 text-sm font-medium mb-1 [text-shadow:_#00000060_0_0_10px]">{title}</p>
            {
                value.map((v, i) => {
                    return <p className="text-zinc-50 text-sm ml-2 [text-shadow:_#00000060_0_0_10px]">{v}</p>
                })
            }
        </div>
    );
}

export default function Exif({exif}) {
    return (
        <div className="overflow-y-auto transparent-scrollbar w-full h-full p-3 space-y-4 break-all">
            {InfoItem("Prompt", [exif.prompt])}
            {InfoItem("Negative", [exif.uc])}
            {InfoItem("Resolution", [exif.width + "x" + exif.height])}
            {InfoItem("Sampler", [exif.sampler])}
            {InfoItem("Steps", [exif.steps])}
            {InfoItem("Seed", [exif.seed])}
            {InfoItem("Noise Scheduler", [exif.noise_schedule])}
            {InfoItem("Prompt Guidance", [exif.scale])}
            {InfoItem("Prompt Guidance Rescale", [exif.cfg_rescale])}
            {InfoItem("SMEA & DYN", [(exif.sm ? "SMEA" : "None") + (exif.dyn ? ", DYN" : "")])}
            {InfoItem("Post Processing", [
                "Brightness: " + exif.config.brightness,
                "Expousure: " + exif.config.exposure,
                "Contrast: " + exif.config.contrast,
                "Saturation: " + exif.config.saturation,
                "Temperature: " + exif.config.temperature,
                "Tint: " + exif.config.tint,
                "Shadows: " + exif.config.shadows,
                "Highlights: " + exif.config.highlights,
                "Sharpness: " + exif.config.sharpness,
            ])}
        </div>
    )
}