import {gl} from "../context";

export class ArrayBufferNative {

	rawData: ArrayBuffer;
	buffer: WebGLBuffer;
	size: number;
	type: number;
	normalize: boolean;
	stride: number;
	offset: number;
	dataByteLength: number;

	constructor(data: ArrayBuffer, dataByteLength: number, size: number, type: number, normalize?: boolean, stride?: number, offset?: number) {

		this.rawData = data;
		this.dataByteLength = dataByteLength;
		this.size = size;
		this.type = type;
		this.normalize = !!normalize;
		this.stride = stride ? stride : 0;
		this.offset = offset ? offset : 0;

		this.buffer = gl.createBuffer() as WebGLBuffer;
		this.updateBuffer(data);
	}

	createArray(data: ArrayBuffer) {
		switch (this.type) {
			case gl.FLOAT:return new Float32Array(data);
			case gl.INT: return new Int32Array(data);
			case gl.UNSIGNED_BYTE: return new Uint8Array(data);
			default: return new Uint8Array(data);
		}
	}

	updateBuffer(data: ArrayBuffer) {
		this.rawData = data;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.createArray(data), gl.STATIC_DRAW, 0, this.dataByteLength);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	getBufferLength() {

	}
}