export var gl: WebGL2RenderingContext;
export const resizeListener: (() => void)[] = [];

export function setContext(context: WebGL2RenderingContext) {
	gl = context;
}

export function resizeDrawingBuffer() {
	for (const listener of resizeListener) {
		listener();
	}
}