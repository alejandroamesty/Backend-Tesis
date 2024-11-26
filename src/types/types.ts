const MIME_TYPES: Record<string, string> = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.ogg': 'video/ogg',
};

export const IMAGE_MIME_TYPES = ['.png', '.jpg', '.jpeg', '.webp'];
export const VIDEO_MIME_TYPES = ['.mp4', '.webm', '.ogg'];
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
	& Omit<T, Keys>
	& { [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>> }[Keys];

export default MIME_TYPES;
