import searchService from '../services/search.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';

class SearchController {
	async search(req: Request, res: Response) {
		try {
			const { parameter, page } = req.query; //example: /search?parameter=example&page=1
			const results = await searchService.search(parameter, page);

			return res.json({
				msg: 'Busqueda realizada con exito',
				data: results,
			});
		} catch (err: unknown) {
			handleError(err, res);
		}
	}
}

export default new SearchController();
