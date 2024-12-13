import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import EmissionCalculator from '../utils/EmissionCalculator/EmissionCalculator.ts';

class CarbonFootprintController {
	public getCarbonFootprint(req: Request, res: Response) {
		try {
			//direc emissions
			const { personalVehicle, publicTransport, aircraftTravels } = req.body;

			//indirect emissions
			const { acUnits, kitchen } = req.body;

			//other indirect emissions
			const { food, consumedFood, plastic } = req.body;

			let directEmissions = 0;
			let indirectEmissions = 0;
			let otherIndirectEmissions = 0;

			if (personalVehicle) {
				const {
					carNumber,
					kilometers,
					fuelType,
					subType,
					year,
					electricConsumptionPercentage,
					carType,
				} = personalVehicle;

				verifyTypes([
					{
						value: [carNumber, kilometers],
						type: 'number',
					},
					{ value: [fuelType, year, carType], type: 'string' },
					{ value: electricConsumptionPercentage, type: 'number', optional: true },
					{ value: subType, type: 'string', optional: true },
				]);

				const carEmissions = EmissionCalculator.calculateVehicleEmission(
					{
						carNumber,
						kilometers,
						fuelType,
						subType,
						year,
						electricConsumptionPercentage,
						carType,
					},
				);

				directEmissions += carEmissions;
			}

			if (publicTransport) {
				const { publicTransportType, distance, trips } = publicTransport;

				verifyTypes([
					{ value: publicTransportType, type: 'string' },
					{ value: [distance, trips], type: 'number' },
				]);

				const publicTransportEmissions = EmissionCalculator.calculateVehicleEmission(
					{
						carNumber: 1,
						kilometers: distance * trips * 2,
						fuelType: 'gasoline',
						year: '1983-2006',
						carType: publicTransportType,
						publicTransport: true,
					},
				);

				directEmissions += publicTransportEmissions;
			}

			if (aircraftTravels) {
				const { domestic, short, long } = aircraftTravels;

				verifyTypes(
					{
						value: [domestic, short, long],
						type: 'number',
						optional: true,
					},
				);

				if (domestic) {
					const domesticEmissions = EmissionCalculator.calculateAircraftEmission(
						{ trips: domestic, aircraftType: 'domestic' },
					);

					directEmissions += domesticEmissions;
				}

				if (short) {
					const shortEmissions = EmissionCalculator.calculateAircraftEmission(
						{ trips: short, aircraftType: 'short' },
					);

					directEmissions += shortEmissions;
				}

				if (long) {
					const longEmissions = EmissionCalculator.calculateAircraftEmission(
						{ trips: long, aircraftType: 'long' },
					);

					directEmissions += longEmissions;
				}
			}

			if (acUnits) {
				const { acNumber, acType, activeMonths, activeHours, persons } = acUnits;
				verifyTypes([
					{ value: [acNumber, activeMonths, activeHours, persons], type: 'number' },
					{ value: acType, type: 'string' },
				]);

				const acEmissions = EmissionCalculator.calculateAcEmission({
					acNumber,
					acType,
					activeMonths,
					activeHours,
					persons,
				});

				indirectEmissions += acEmissions;
			}

			if (kitchen) {
				const { kitchenType, burners, activeDays, timesPerDay, timePerMeal } = kitchen;

				verifyTypes([
					{ value: [burners, activeDays, timesPerDay, timePerMeal], type: 'number' },
					{ value: kitchenType, type: 'string' },
				]);

				const kitchenEmissions = EmissionCalculator.calculateKitchenEmission({
					kitchenType,
					burners,
					activeDays,
					timesPerDay,
					timePerMeal,
				});

				indirectEmissions += kitchenEmissions;
			}

			if (food) {
				const { foodType, foodAmount } = food;

				verifyTypes([
					{ value: foodAmount, type: 'number' },
					{ value: foodType, type: 'string' },
				]);

				const foodEmissions = EmissionCalculator.calculateFoodEmission({
					foodType,
					foodAmount,
				});

				otherIndirectEmissions += foodEmissions;
			}

			if (consumedFood) {
				const { foodType } = consumedFood;

				verifyTypes([{ value: foodType, type: 'string' }]);

				const consumedFoodEmissions = EmissionCalculator.calculateConsumedFoodEmission({
					foodType,
				});

				otherIndirectEmissions += consumedFoodEmissions;
			}

			if (plastic) {
				const { plasticAmount } = plastic;

				verifyTypes({ value: plasticAmount, type: 'string' });

				const plasticEmissions = EmissionCalculator.calculatePlasticEmission({
					plasticAmount,
				});

				otherIndirectEmissions += plasticEmissions;
			}

			res.status(200).json({
				msg: 'Success',
				data: {
					directEmissions: directEmissions,
					indirectEmissions: indirectEmissions,
					otherIndirectEmissions: otherIndirectEmissions,
					total: directEmissions + indirectEmissions + otherIndirectEmissions,
				},
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new CarbonFootprintController();
