import db from '../app/db.ts';

class CategoriesService {
	private categories: { id: string; name: string }[] = [];

	constructor() {
		db.selectFrom('post_categories').selectAll().execute().then((categories) => {
			this.categories = categories;
		});
	}

	get categoriesList() {
		return this.categories;
	}

	getCategoryById(id: string) {
		return this.categories.find((category) => category.id === id);
	}

	getCategoryByName(name: string) {
		return this.categories.find((category) => category.name === name);
	}
}

export default new CategoriesService();
