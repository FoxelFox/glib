import {gl} from "../context";

export class Texture {

	x: number;
	y: number;
	webGLTexture: WebGLTexture;
	webGLTexture2!: WebGLTexture;

	fitSizeToCanvas: boolean;

	constructor (
		x?: number,
		y?: number,
		private data?: ArrayBufferView,
		private iFormat?: number,
		private format?: number,
		private type?: number
	) {
		this.fitSizeToCanvas = !x && !y;
		this.x = x || gl.drawingBufferWidth;
		this.y = y || gl.drawingBufferHeight;
		this.webGLTexture = this.create();
	}

	makeDoubleBuffered() {
		if (!this.webGLTexture2) {
			this.webGLTexture2 = this.create();
		}
	}

	flip() {
		const t = this.webGLTexture;
		this.webGLTexture = this.webGLTexture2;
		this.webGLTexture2 = t;
	}

	update(data: ArrayBufferView) {
		// TODO: double buffered update
		gl.bindTexture(gl.TEXTURE_2D, this.webGLTexture);

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			this.iFormat || gl.RGBA,
			this.x,
			this.y,
			0,
			this.format || gl.RGBA,
			this.type || gl.UNSIGNED_BYTE,
			data
		);
	}

	resize(x: number, y: number) {
		this.x = x;
		this.y = y;

		gl.bindTexture(gl.TEXTURE_2D, this.webGLTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, this.iFormat || gl.RGBA, this.x, this.y, 0, this.format || gl.RGBA, this.type || gl.UNSIGNED_BYTE, this.data ? this.data : null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	resizeToCanvas() {
		this.resize(gl.drawingBufferWidth, gl.drawingBufferHeight);
	}

	private create(): WebGLTexture {
		const id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, id);
		gl.texImage2D(gl.TEXTURE_2D, 0, this.iFormat || gl.RGBA, this.x, this.y, 0, this.format || gl.RGBA, this.type || gl.UNSIGNED_BYTE, this.data ? this.data : null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return id as WebGLTexture;
	}

}