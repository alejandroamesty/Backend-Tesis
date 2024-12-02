import communitiesService from '../services/communities.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { BadRequestError } from '../utils/errors/httpErrors.ts';

class CommunitiesController {
	async getAll(req: Request, res: Response) {
		try {
			const user_id = req.user;
			verifyTypes({ value: user_id, type: 'uuid' });
			const communities = await communitiesService.getAll(user_id);
			res.json({ msg: 'Comunities encontradas con exito', data: communities });
		} catch (error) {
			handleError(error, res);
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const id = req.params.id;

			verifyTypes([{ value: [user_id, id], type: 'uuid' }]);

			const community = await communitiesService.getById(id, user_id);
			res.json({ msg: 'Comunity encontrada con exito', data: community });
		} catch (error) {
			handleError(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const { private_community, members, image, name, description } = req.body;

			console.log(req.body);

			verifyTypes([
				{ value: private_community, type: 'boolean' },
				{ value: user_id, type: 'uuid' },
				{ value: members, type: 'uuid', optional: true },
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
			const id = req.params.id;
			const { name, description, image, private_community } = req.body;

			verifyTypes([
				{ value: [name, description, image], type: 'string', optional: true },
				{ value: private_community, type: 'boolean', optional: true },
				{ value: [id, user_id], type: 'uuid' },
			]);

			if (!name && !description && image === undefined && private_community === undefined) {
				throw new BadRequestError('Se necesita al menos un campo para actualizar');
			}

			const result = await communitiesService.update(id, user_id, {
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
			const id = req.params.id;
			verifyTypes([{ value: [id, user_id], type: 'uuid' }]);
			const result = await communitiesService.delete(id, user_id);
			res.json({ msg: 'Comunity eliminada con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async addMember(req: Request, res: Response) {
		try {
			const _user_id = req.user;
			const community_id = req.params.community_id;
			const user_id = req.body.user_id;
			verifyTypes([{ value: [_user_id, community_id, user_id], type: 'uuid' }]);

			const result = await communitiesService.addMember(
				community_id,
				_user_id,
				user_id,
			);
			res.status(201).json({ msg: 'Miembro agregado con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async removeMember(req: Request, res: Response) {
		try {
			const _user_id = req.user;
			const community_id = req.params.community_id;
			const user_id = req.body.user_id;

			verifyTypes([{ value: [user_id, community_id, _user_id], type: 'uuid' }]);

			const result = await communitiesService.removeMember(
				community_id,
				_user_id,
				user_id,
			);
			res.status(200).json({ msg: 'Miembro eliminado con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}

	async joinCommunity(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const community_id = req.params.id;
			verifyTypes([{ value: [user_id, community_id], type: 'uuid' }]);
			const result = await communitiesService.joinCommunity(
				community_id,
				user_id,
			);
			res.status(201).json({ msg: 'Te has unido a la comunidad con exito', data: result });
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new CommunitiesController();
