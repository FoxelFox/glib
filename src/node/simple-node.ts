
import {Shader} from "../shader/shader";
import {gl} from "../context";
import {ArrayBuffer} from "../data/array-buffer";
import {FrameBuffer} from "../data/frame-buffer";
import {ArrayBufferNative} from "../data/array-buffer-native";

export abstract class SimpleNode {

	vao: WebGLVertexArrayObject;
	frameBuffer!: FrameBuffer;

	protected constructor(
		public shader: Shader,
		public attributes: {[key: string]: ArrayBuffer | ArrayBufferNative}
	) {
		this.vao = gl.createVertexArray() as WebGLVertexArrayObject;

		gl.bindVertexArray(this.vao);

		for(let attribute in this.attributes) {
			const a = this.attributes[attribute];

			gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
			gl.enableVertexAttribArray(this.shader.getAttributeLocation(attribute));
			gl.vertexAttribPointer(this.shader.getAttributeLocation(attribute), a.size, a.type, a.normalize, a.stride, a.offset);
		}

		gl.bindVertexArray(null);
	}

	init() {

	}

	run() {
		this.frameBuffer.bind();
		gl.useProgram(this.shader.program);
		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

}