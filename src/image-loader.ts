function createWorker(f: () => void) {
	return new Worker(URL.createObjectURL(new Blob([`(${f})()`])));
}

const worker = createWorker(() => {
	self.addEventListener('message', e => {
		const src = e.data.src;
		const useOffscreen = e.data.useOffscreen;

		fetch(src, { mode: 'cors' })
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob))
			.then(bitmap => {
				let img;

				if (useOffscreen) {
					const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
					const ctx = <any>canvas.getContext('2d') as CanvasRenderingContext2D;

					ctx.drawImage(bitmap, 0, 0);
					img = new Uint8Array(ctx.getImageData(0, 0, bitmap.width, bitmap.height).data);
					// @ts-ignore
					self.postMessage({ src, img });
				} else {
					img = bitmap;
					// @ts-ignore
					self.postMessage({ src, img }, [img]);
				}
			});
	});
});

/**
 * Returns Uint8Array when Offscreen supported by browser otherwise CanvasImageSource
 * @param src Image URL
 * @param useOffscreen set true if browser supports OffscreenCanvas
 */
function loadImageWithWorker(src: string, useOffscreen: boolean): Promise<Uint8Array | CanvasImageSource> {
	return new Promise((resolve, reject) => {
		function handler(e: any) {
			if (e.data.src === src) {
				worker.removeEventListener('message', handler);
				if (e.data.error) {
					reject(e.data.error);
				}
				resolve(e.data.img);
			}
		}
		worker.addEventListener('message', handler);
		worker.postMessage({src, useOffscreen});
	});
}

export const loadImageBuffer = loadImageWithWorker;