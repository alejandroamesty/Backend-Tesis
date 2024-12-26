/*			const { personalVehicle, publicTransport, aircraftTravels } = req.body;

			//indirect emissions
			const { acUnits, kitchen } = req.body;

			//other indirect emissions
			const { food, consumedFood, plastic } = req.body;
*/
import { assertEquals } from '@std/assert';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/carbon-footprint/calculate`
	: 'http://localhost:4000/carbon-footprint/calculate';

Deno.test('integration: carbonFootprint - carbonFootprint - calculate carbon footprint', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			personalVehicle: {
				carNumber: 1,
				carType: 'car',
				kilometers: 1700,
				year: '2007-2024',
				fuelType: 'diesel',
			},
			publicTransport: {
				publicTransportType: 'heavy_truck',
				trips: 30,
				distance: 20,
			},
			acUnits: {
				acNumber: 1,
				acType: 'split',
				activeMonths: 6,
				activeHours: 8,
				persons: 2,
			},
			kitchen: {
				'kitchenType': 'electric',
				'burners': 2,
				'activeDays': 4,
				'timesPerDay': 1,
				'timePerMeal': 1,
			},
			food: {
				foodType: 'bird',
				foodAmount: 3.5,
			},
			consumedFood: {
				foodType: 'fresh_locales',
			},
			plastic: {
				plasticAmount: 'often',
			},
		}),
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();
});

Deno.test('integration: carbonFootprint - carbonFootprint - invalid calculate carbon footprint', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			personalVehicle: {
				carNumber: 1,
				carType: 'car',
			},
			publicTransport: {
				publicTransportType: 'heavy_truck',
				trips: 30,
				distance: 20,
			},
			acUnits: {
				acNumber: 1,
				acType: 'split',
				activeMonths: 6,
				activeHours: 8,
				persons: 2,
			},
			kitchen: {
				'kitchenType': 'electric',
				'burners': 2,
				'activeDays': 4,
				'timesPerDay': 1,
				'timePerMeal': 1,
			},
			food: {
				foodType: 'bird',
				foodAmount: 3.5,
			},
			consumedFood: {
				foodType: 'fresh_locales',
			},
			plastic: {
				plasticAmount: 'often',
			},
		}),
	});
	assertEquals(response.status, 400);
	await response.body?.cancel();
});
