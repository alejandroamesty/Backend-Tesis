// @deno-types="@types/express"
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';
import reportService from '../services/report.service.ts';

class ReportController {
	async getReports(req: Request, res: Response) {
		const user = req.user;
		const x = Number(req.query.x);
		const y = Number(req.query.y);
		const radius = Number(req.query.radius) || 1;
		try {
			verifyTypes([
				{ value: [x, y, radius], type: 'number' },
				{ value: user, type: 'uuid' },
			]);

			const reports = await reportService.getReports({ x, y }, radius, 1);

			res.json({
				msg: 'Data encontrada con exito',
				data: reports,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getReport(req: Request, res: Response) {
		try {
			const id = req.params.id;
			verifyTypes({ value: id, type: 'uuid' });
			const report = await reportService.getReport(id);
			if (!report) throw new NotFoundError('Reporte no encontrado');

			const response = {
				msg: 'Data encontrada con exito',
				data: report,
			};

			res.json(response);
		} catch (error) {
			handleError(error, res);
		}
	}

	async createReport(req: Request, res: Response) {
		try {
			const { caption, coordinates, content, videos, images } = req.body;
			const x = coordinates?.x || undefined;
			const y = coordinates?.y || undefined;
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes([
				{ value: [caption, content], type: 'string' },
				{ value: [x, y], type: 'number' },
				{ value: videos, type: 'video', optional: true },
				{ value: images, type: 'image', optional: true },
			]);

			const post = await reportService.createReport({
				post_data: {
					caption: caption as string,
					user_id: user_id,
					content: content as string,
				},
				coordinates: (coordinates as { x: number; y: number }) ?? undefined,
				videos: videos as string[],
				images: images as string[],
			});

			return res.json({
				msg: 'Reporte creado con exito',
				data: post,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async deleteReport(req: Request, res: Response) {
		try {
			const id = req.params.id;
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes({ value: [id, user_id], type: 'uuid' });

			const post = await reportService.deleteReport(id, user_id);

			return res.json({
				msg: 'Reporte eliminado con exito',
				data: post,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new ReportController();
