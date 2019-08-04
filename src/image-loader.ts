function createWorker(f: () => void) {
	return new Worker(URL.createObjectURL(new Blob([`(${f})()`])));
}

const worker = createWorker(() => {
	self.addEventListener('message', e => {
		const src = e.data.src;
		const width = e.data.width;
		const height = e.data.height;

		fetch(src, { mode: 'cors' })
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob))
			.then(bitmap => {

				let img;

				if ("OffscreenCanvas" in window) {
					const canvas = new OffscreenCanvas(width, height);
					const ctx = <any>canvas.getContext('2d') as CanvasRenderingContext2D;
					ctx.drawImage(bitmap, 0, 0);
					img = new Uint8Array(ctx.getImageData(0, 0, width, height).data);
				} else {
					const ctx = (<any>document.getElementById("imgc")).getContext("2d");
					ctx.drawImage(bitmap, 0, 0);
					const imageData = ctx.getImageData(0, 0, width, height);
					img = new Uint8Array(imageData.data);
				}
				// @ts-ignore
				self.postMessage({ src, img });
			});
	});
});

function loadImageWithWorker(src: string, width: number, height: number, hasOffscreenCanvas: boolean) {
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
		worker.postMessage({src, width, height});
	});
}

export const loadImageBuffer = loadImageWithWorker;