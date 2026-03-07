export interface MathSymbol {
    id: string; // Internal id for tracking this specific exact instance of a shape (e.g. sym_1_x)
    charString: string; // The literal math character (e.g. "x", "=", "2")
    x: number;
    y: number;
    scale: number;
    pathData: string;
}

export class EquationParser {

    /**
     * Parses a raw LaTeX string into an array of strictly positioned MathSymbols.
     */
    public static parseEquation(tex: string): MathSymbol[] {
        const svgString = this.generateRawSVG(tex);
        return this.extractSymbols(svgString);
    }

    /**
     * Internal: Generates a raw SVG string from MathJax using the browser CDN runtime.
     */
    private static generateRawSVG(tex: string): string {
        if (typeof window === 'undefined' || !(window as any).MathJax) {
            console.error("MathJax is not loaded in the window context.");
            return "";
        }

        try {
            const tempNode = (window as any).MathJax.tex2svg(tex, { display: true });
            const svgElement = tempNode.querySelector('svg');
            if (svgElement) {
                return svgElement.outerHTML;
            }
        } catch (e) {
            console.error("MathJax failed to compile SVG:", e);
        }
        return "";
    }

    /**
     * Parses the MathJax SVG XML and rips out the absolute coordinates and path data of every symbol.
     */
    private static extractSymbols(svgString: string): MathSymbol[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");

        const symbols: MathSymbol[] = [];

        // MathJax defines all its paths inside <defs> with ids like 'MJX-1-TEX-N-78'
        const pathDict: Record<string, string> = {};

        const defNodes = doc.querySelectorAll('defs path');
        defNodes.forEach(node => {
            pathDict[node.id] = node.getAttribute('d') || '';
        });

        // Track how many of a specific character we've seen to assign unique tracked IDs (e.g., first 'x' vs second 'x')
        let idCounter = 0;

        // Recursively traverse the SVG <g> groups to accumulate transforms (translate/scale)
        function traverse(node: Element, currentX: number, currentY: number, currentScale: number) {
            let nextX = currentX;
            let nextY = currentY;
            let nextScale = currentScale;

            // Extract transformation if it exists on <g> or <use>
            const transform = node.getAttribute('transform');
            if (transform) {
                // Parse translate
                const transMatch = transform.match(/translate\(([-0-9.]+),?\s*([-0-9.]+)?\)/);
                if (transMatch) {
                    nextX += parseFloat(transMatch[1]) * currentScale;
                    nextY += (transMatch[2] ? parseFloat(transMatch[2]) : 0) * currentScale;
                }

                // Parse scale
                const scaleMatch = transform.match(/scale\(([-0-9.]+),?\s*([-0-9.]+)?\)/);
                if (scaleMatch) {
                    nextScale *= parseFloat(scaleMatch[1]);
                }
            }

            // Mathjax 3 puts exact coordinates directly on the <use> tags as well.
            const useX = parseFloat(node.getAttribute('x') || '0');
            const useY = parseFloat(node.getAttribute('y') || '0');

            nextX += useX * currentScale;
            nextY += useY * currentScale;

            if (node.tagName.toLowerCase() === 'use') {
                const href = node.getAttribute('href') || node.getAttribute('xlink:href');
                if (href && href.startsWith('#')) {
                    const pathId = href.substring(1); // e.g. 'MJX-1-TEX-N-78'
                    if (pathDict[pathId]) {
                        idCounter++;

                        // Try to get the semantic character MathJax attaches to the node
                        let semanticChar = node.getAttribute('data-c');
                        if (!semanticChar) {
                            // Fallback constraint if data-c isn't on the use tag (sometimes it's on the parent <g>)
                            semanticChar = node.parentElement?.getAttribute('data-c') || null;
                        }

                        // Convert hex string "1D465" into literal "x" if MathJax provided it
                        let literalChar = "unknown";
                        if (semanticChar) {
                            literalChar = String.fromCodePoint(parseInt(semanticChar, 16));
                        } else {
                            // Absolute fallback: use the last segment of the SVG name
                            const nameParts = pathId.split('-');
                            literalChar = nameParts[nameParts.length - 1];
                        }

                        symbols.push({
                            id: `sym_${idCounter}_${literalChar}`,
                            charString: literalChar,
                            x: nextX,
                            y: nextY,
                            scale: nextScale,
                            pathData: pathDict[pathId]
                        });
                    }
                }
            } else if (node.tagName.toLowerCase() === 'rect') {
                // MathJax uses raw <rect> tags for fraction lines and square root overlines
                const rectW = parseFloat(node.getAttribute('width') || '0');
                const rectH = parseFloat(node.getAttribute('height') || '0');

                if (rectW > 0 && rectH > 0) {
                    idCounter++;
                    // Convert rect to a closed SVG path
                    const rectPath = `M 0 0 h ${rectW} v ${rectH} h -${rectW} Z`;

                    symbols.push({
                        id: `sym_${idCounter}_rect`,
                        charString: 'structural_line', // a generic ID for diffing
                        x: nextX,
                        y: nextY,
                        scale: nextScale,
                        pathData: rectPath
                    });
                }
            }

            // Recurse down children
            Array.from(node.children).forEach(child => {
                traverse(child, nextX, nextY, nextScale);
            });
        }

        const rootG = doc.querySelector('svg > g');
        if (rootG) {
            traverse(rootG, 0, 0, 1.0);
        }

        // --- Center the Equation ---
        // MathJax equations originate from an arbitrary font baseline. 
        // We calculate the global bounding box and shift all coordinates to originate exactly from (0,0).
        if (symbols.length > 0) {
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;

            for (const sym of symbols) {
                // Approximate bounding volume based on origin (pathData actual extent varies, but origin is sufficient for centering layout)
                if (sym.x < minX) minX = sym.x;
                if (sym.x > maxX) maxX = sym.x;
                if (sym.y < minY) minY = sym.y;
                if (sym.y > maxY) maxY = sym.y;
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            for (const sym of symbols) {
                sym.x -= centerX;
                sym.y -= centerY;
            }
        }

        return symbols;
    }
}
