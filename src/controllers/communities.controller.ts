import communitiesService from '../services/communities.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { BadRequestError } from '../utils/errors/httpErrors.ts';

class CommunitiesController {
	async getAll(req: Request, res: Response) {
		const user_id = req.user;
		try {
			const communities = await communitiesService.getAll(user_id);
			res.json({ msg: 'Comunities encontradas con exito', data: communities });
		} catch (error) {
			handleError(error, res);
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const id = parseInt(req.params.id);
			const community = await communitiesService.getById(Number(id), Number(user_id));
			console.log(user_id, id, community);
			res.json({ msg: 'Comunity encontrada con exito', data: community });
		} catch (error) {
			handleError(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const { private_community, members, image, name, description } = req.body;

			verifyTypes([
				{ value: private_community, type: 'boolean' },
				{ value: members, type: 'number', optional: true },
				{ value: [image, description], type: 'string', optional: true },
				{ value: name, type: 'string' },
			]);

			const result = await communitiesService.create({
				user_id,
				members: members ?? [],
				image: image ?? null,
				name,
				description: description ?? null,
				private_community,
			});
			res.status(201).json({ msg: 'Comunity creada con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async update(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const id = parseInt(req.params.id);
			const { name, description, image, private_community } = req.body;

			verifyTypes([
				{ value: [name, description, image], type: 'string', optional: true },
				{ value: private_community, type: 'boolean', optional: true },
			]);

			if (!name && !description && !image) {
				throw new BadRequestError('Se necesita al menos un campo para actualizar');
			}

			const result = await communitiesService.update(Number(id), Number(user_id), {
				name: name,
				description: description,
				image: image,
				private_community: private_community,
			});
			res.json({ msg: 'Comunity actualizada con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const id = parseInt(req.params.id);
			const result = await communitiesService.delete(Number(id), Number(user_id));
			res.json({ msg: 'Comunity eliminada con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async addMember(req: Request, res: Response) {
		try {
			const _user_id = req.user;
			const community_id = parseInt(req.params.community_id);
			const { user_id } = req.body;
			verifyTypes([{ value: user_id, type: 'number' }]);

			const result = await communitiesService.addMember(
				Number(community_id),
				Number(_user_id),
				Number(user_id),
			);
			res.status(201).json({ msg: 'Miembro agregado con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async removeMember(req: Request, res: Response) {
		try {
			const _user_id = req.user;
			const member_id = parseInt(req.params.id);
			const { user_id } = req.body;

			verifyTypes([{ value: user_id, type: 'number' }]);

			const result = await communitiesService.removeMember(
				Number(user_id),
				Number(_user_id),
				Number(member_id),
			);
			res.status(200).json({ msg: 'Miembro eliminado con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new CommunitiesController();
