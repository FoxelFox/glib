function createWorker(f: () => void) {
	return new Worker(URL.createObjectURL(new Blob([`(${f})()`])));
}

let worker: Worker;



function loadImageWithWorker(src: string, useOffscreen: boolean): Promise<Uint8Array> {

	if (!worker) {
		worker = createWorker(() => {
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
	}

	return new Promise((resolve, reject) => {
		function handler(e: any) {
			if (e.data.src === src) {
				worker.removeEventListener('message', handler);
				if (e.data.error) {
					reject(e.data.error);
				}

				// for shit browsers but maybe it fails anyway ...
				if (useOffscreen) {
					resolve(e.data.img);
				} else {
					try {
						const i = e.data.img as ImageBitmap;
						const canvas = document.createElement("canvas");
						canvas.width = i.width;
						canvas.height = i.height;
						const ctx = canvas.getContext("2d");

						if (ctx) {
							ctx.drawImage(i, 0, 0);
							resolve(new Uint8Array(ctx.getImageData(0, 0, i.width, i.height).data));
						} else {
							reject("cant create canvas");
						}
					} catch (e) {
						reject(e);
					}
				}
			}
		}
		worker.addEventListener('message', handler);
		worker.postMessage({src, useOffscreen});
	});
}

export const loadImageBuffer = loadImageWithWorker;