import {gl} from "../context";

export class TextureArray {

	webGLTexture: WebGLTexture;

	constructor (
		public x: number,
		public y: number,
		public z: number,
		private data?: ArrayBufferView,
		private iFormat?: number,
		private format?: number,
		private type?: number,
		private filter?: number,
		private mipMaps?: boolean
	) {
		this.webGLTexture = this.create();
	}

	private create(): WebGLTexture {
		const id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, id);


		if (this.data) {
			gl.texImage3D(
				gl.TEXTURE_2D_ARRAY,
				0,
				this.iFormat || gl.RGBA,
				this.x,
				this.y,
				this.z,
				0,
				this.format || gl.RGBA,
				this.type || gl.UNSIGNED_BYTE,
				this.data,
				0
			);
		}

		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, this.filter || gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, this.filter || gl.NEAREST);

		if (this.mipMaps) {
			gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
		}

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

		return id as WebGLTexture;
	}

	update(data: ArrayBufferView, index: number) {
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.webGLTexture);

		gl.texSubImage3D(
			gl.TEXTURE_2D_ARRAY, 0,
			0, 0 ,index,
			this.x,
			this.y,
			1,
			this.format || gl.RGBA,
			this.type || gl.UNSIGNED_BYTE,
			data,
			index * this.x * this.y * 4
		);

		if (this.mipMaps) {
			gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
		}

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
	}

}