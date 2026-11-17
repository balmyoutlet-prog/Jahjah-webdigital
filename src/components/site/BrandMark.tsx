import { Link } from "@tanstack/react-router";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Jahjah WebDigital — home">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-[#f8ddda] shadow-soft">
        <img
          src="data:image/webp;base64,UklGRlAFAABXRUJQVlA4IEQFAACQHgCdASqgAKAAPpFGnkulo6KhovHJ8LASCWlu3V6P//qc1317U5YX7bzQ0rk8x33f3oX0YSvwpMZmczFP+F52RLtEWDvFkMGWzQw9t/5vkLAHMtvMaDi1aIEjTrXYcNLYgeSlcA2a0VLZbdbKXNBPVX9pH/ZUukilhO5pgXluDS0LreGsi3VicbW+GtKW+Btn8ZUtf1vrE+DGPEcGOh+cg1LLNOFeyhWNnffuGO4iSsrInYgoaxenDQ53c/hwuviGygy7HZ+PPlQKjRjeRyLueV20vEaxPgnLmPDizQD8Gi0kHx3BM0n1Q9lUJj1n24ziYAReJFw8wh5XRcHgAP74MzmhkP8CStWbWPyWnvwH7y9JsJuB8OvoElmF23C+DmRWRaoQ/ReUTf1f1XMBNYsLNABxw8phLrBqExRjUFsE2pA8V70egVoc6FT9hjJAv9TohriIIonTOha0VpFHdlTn0CxxcWbPurM90e/0L7IaRADE+kNEPBEe9xthOp8C2IaG0Un7siiWC4XegrofCRU4X8vjhuBKD0xpk93YVO5Tiz1oKCc825JO1B0ULIfOptYZKCQgJqYMr4+I+LY2let52Gk/TSnsSQPbYAvCj/iamc+5/A/iFoRrp4NMAp8LwggXPvg4MyiyiNUqZFs+xUPXM1xqxNasEp0n3Z7+q0BUh/MILWr2O4M7P7UVAAmRN0KNzIjRJbNyPAPUDPCUPgTNue7a9yO/EkRLpfdDituRuAXCn1DkyBzXcgaDsZrR3tXVhCtH9w7flAo0v5rUwA+8AB7YdZJneFum0M/7590UwC7w+rLv1U1phjadhJ3BrW49LBamA49815v862tBjlRV28CcKc0jhJNG1o/COtTN3I0CaG2K4Dtk0pArRW6ctGbvoKGt4/vYJvzRJMMKOCDPK9QT4ngC1dVJzvBTjIKNWRJASPAAwflcl3M2+ZhR0Ux6y3rBNs/eFYcL1+38xPv53+5xhz1oWUvm7iJMfyUcVu7WY9nQqWJmrs1QsX7y7uAzqb7b4GvlrKQuZ51fipScioAOn0RwXdasOiNL6dvx8CA7+ZQglVAFGF7x87y8gbVPH6SUtgF/bYtKlTFVpcNNuMi0VyvOX6wT8oATaHtWNrkSKVsjxiySOUD3sHS3Lddo3S9R759Ksg4MszW/IO0prYXBj45N/itpmjFwSAwxiuM+L3o/QE5wA7vxfUCLN9tsFiniEEHhD9obrodC3c4CPx2hy39ggpUcQKb4ttvM0Xb4jgS9fwFWotukBf6v4xjbGpg967cnw7nIZkPECqIp2a7k9U8bON6boLsHFBLaQO2dhI3qL1OcbCn/jIooV0f0EY9NyBoZjpPSzX3CxmlQA3kz2COjqmbemOFZ36A9t4F5wWMiAfkiiVNTNKyWHUu8HSmlMbTDawyIk/xtyWGR/cV/Xum08bDTxtRWn/oXfiyevph8aWUgXrsqsUmcFNU82RwWRz6I3zmXluSTXe9dVplB1WORJKFXZxUAw8yCL/q0xO2eBI/fGyXukcEjbYqx/FIOKtP7532ZOYBHLPIxH7ThRDpDIp/vAxRPuNnMUaAqOpEd56zNQtqvuOZ3P4oXf0N052k7XXHhGH1tfuc+46TMIQFqbwFdPjmh4PPTHQvayYmTgZOc3X7zvJWIVcGV1F6mePk/ilSUyim8p0kl5HpqlQ+Iel8tHsQCAtIB6gjp/wYitEfihfjo2n865stmirGFMYIauanP6wP6RsNhE5MhFONy+SexKMu2dU6m8ssZY66tU+0G6do3wmrgKBGAAAAA"
          alt=""
          width={160}
          height={160}
          className="h-full w-full scale-[1.08] object-cover"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-sm font-medium tracking-[0.16em] text-foreground">JAHJAH</span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-primary">WebDigital</span>
        </span>
      )}
    </Link>
  );
}
