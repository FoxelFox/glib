import {gl, resizeListener} from "../context";
import {Texture} from "./texture";

export class FrameBuffer {

	fb: WebGLFramebuffer;
	rb!: WebGLRenderbuffer;

	// for double buffering
	private fb2!: WebGLFramebuffer;
	private rb2!: WebGLRenderbuffer;



	constructor(public textures: Texture[], private doubleBuffered?: boolean, private depth?: boolean) {

		if (doubleBuffered) {
			for (let t of this.textures) {
				t.makeDoubleBuffered();
			}

			this.fb2 = this.createFrameBuffer();
		}
		this.fb = this.createFrameBuffer(doubleBuffered);


		if (this.textures[0].fitSizeToCanvas) {
			resizeListener.push(() => {

				for (const t of this.textures) {
					t.resizeToCanvas();
				}

				if (doubleBuffered) {
					this.flip();
					for (const t of this.textures) {
						t.resizeToCanvas();
					}
					this.flip();
				}

				this.deleteFrameBuffer();
				if (doubleBuffered) {
					this.fb2 = this.createFrameBuffer();
				}
				this.fb = this.createFrameBuffer(doubleBuffered);
			});
		}

	}

	createFrameBuffer(doubleBuffered?: boolean): WebGLFramebuffer{
		const fb = gl.createFramebuffer() as WebGLFramebuffer;
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

		let i = 0;
		const attachments = [];
		for (let texture of this.textures) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, doubleBuffered ? texture.webGLTexture2 : texture.webGLTexture, 0);
			attachments.push(gl.COLOR_ATTACHMENT0 + i);
			i++;
		}

		if (this.depth) {

			let depthBuffer;

			if (doubleBuffered) {
				depthBuffer = this.rb2 = gl.createRenderbuffer() as WebGLRenderbuffer;
			} else {
				depthBuffer = this.rb = gl.createRenderbuffer() as WebGLRenderbuffer;
			}

			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.textures[0].x, this.textures[0].y);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
		}



		gl.drawBuffers(attachments);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			console.error("FrameBuffer does not work with this setup!");
		}

		this.unbind();
		return fb;
	}

	deleteFrameBuffer() {
		gl.deleteFramebuffer(this.fb);
		gl.deleteFramebuffer(this.fb2);
		gl.deleteRenderbuffer(this.rb);
		gl.deleteRenderbuffer(this.rb2);
	}

	bind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		gl.viewport(0, 0, this.textures[0].x, this.textures[0].y);
	}

	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	flip() {
		const fb = this.fb;
		this.fb = this.fb2;
		this.fb2 = fb;

		for (let texture of this.textures) {
			texture.flip();
		}
	}
}
