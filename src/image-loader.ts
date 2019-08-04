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
				} else {
					const ctx = (<any>document.getElementById("imgc")).getContext("2d");
					ctx.drawImage(bitmap, 0, 0);
					const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
					img = new Uint8Array(imageData.data);
				}
				// @ts-ignore
				self.postMessage({ src, img });
			});
	});
});

function loadImageWithWorker(src: string, useOffscreen: boolean): Promise<Uint8Array> {
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