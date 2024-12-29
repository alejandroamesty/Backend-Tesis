import vehicleEmissions from './Emission Factors/vehicles.json' with { type: 'json' };
import aircraftEmissions from './Emission Factors/aircraft.json' with { type: 'json' };
import acUnits from './Emission Factors/acUnits.json' with { type: 'json' };
import kitchen from './Emission Factors/kitchen.json' with { type: 'json' };
import food from './Emission Factors/food.json' with { type: 'json' };
import consumedFood from './Emission Factors/consumedFood.json' with { type: 'json' };
import plastic from './Emission Factors/plastic.json' with { type: 'json' };

import { BadRequestError, NotFoundError } from '../errors/httpErrors.ts';
import {
	AcEmissions,
	AcType,
	AircraftEmissions,
	AircraftTypes,
	consumedFoodEmissions,
	consumedFoodType,
	EmissionsData,
	FoodEmissions,
	foodType,
	KitchenEmissions,
	KitchenType,
	VehicleTypes,
	Year,
} from '../../types/emissionTypes.ts';

class EmissionCalculator {
	private vehicleEmissions: EmissionsData;
	private aircraftEmissions: AircraftEmissions;
	private acUnits: AcEmissions;
	private kitchen: KitchenEmissions;
	private food: FoodEmissions;
	private consumedFood: consumedFoodEmissions;
	private plastic: {
		weight: number;
		CO2: number;
		never: number;
		rarely: number;
		sometimes: number;
		often: number;
	};

	constructor() {
		this.vehicleEmissions = vehicleEmissions;
		this.aircraftEmissions = aircraftEmissions;
		this.acUnits = acUnits;
		this.kitchen = kitchen;
		this.food = food;
		this.consumedFood = consumedFood;
		this.plastic = plastic;
	}

	public calculateVehicleEmission(
		{
			carNumber,
			kilometers,
			fuelType,
			subType,
			year,
			electricConsumptionPercentage,
			carType,
			publicTransport,
		}: {
			carNumber: number;
			kilometers: number;
			fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
			subType?: 'diesel' | 'gasoline';
			year: Year;
			electricConsumptionPercentage?: number;
			carType: VehicleTypes;
			publicTransport?: boolean;
		},
	) {
		// Error handling

		if (
			fuelType !== 'diesel' && fuelType !== 'gasoline' && fuelType !== 'electric' &&
			fuelType !== 'hybrid'
		) {
			throw new BadRequestError('Invalid fuel type');
		}

		if (subType && subType !== 'diesel' && subType !== 'gasoline') {
			throw new BadRequestError('Invalid fuel sub type');
		}

		if (
			carType !== 'motorcycle' && carType !== 'car' && carType !== 'light_truck' &&
			carType !== 'heavy_truck'
		) {
			throw new BadRequestError('Invalid car type');
		}

		if (year != '1960-1982' && year != '1983-2006' && year != '2007-2024') {
			throw new BadRequestError('Invalid year');
		}

		if (
			electricConsumptionPercentage && electricConsumptionPercentage < 0 &&
			electricConsumptionPercentage > 1
		) {
			throw new BadRequestError('Invalid electric consumption percentage');
		}

		if (carNumber < 1 || kilometers < 1) {
			throw new BadRequestError('Invalid car number or kilometers');
		}

		switch (fuelType) {
			case 'diesel': {
				return this.getEmissionData(carNumber, fuelType, carType, year, kilometers) * 12; // 12 months
			}
			case 'gasoline': {
				return this.getEmissionData(
					carNumber,
					fuelType,
					carType,
					year,
					kilometers,
					publicTransport,
				) * 12; // 12 months
			}
			case 'electric': {
				return this.getElectricEmissionData(carNumber, carType, kilometers) * 12; // 12 months
			}
			case 'hybrid': {
				if (!electricConsumptionPercentage) {
					throw new BadRequestError(
						'Electric consumption percentage is required for hybrid vehicles',
					);
				}

				if (!subType) {
					throw new BadRequestError('Subtype is required for hybrid vehicles');
				}

				return this.getHybridEmissionData(
					carNumber,
					subType,
					year,
					carType,
					electricConsumptionPercentage,
					kilometers,
				) * 12; // 12 months
			}
		}
	}

	public calculateAcEmission({
		acNumber,
		acType,
		activeMonths,
		activeHours,
		persons,
	}: {
		acNumber: number;
		acType: AcType;
		activeMonths: number;
		activeHours: number;
		persons: number;
	}) {
		if (acNumber < 1 || activeMonths < 1 || activeHours < 1) {
			throw new BadRequestError('Invalid number of air conditioners, months or hours');
		}

		const { kwh } = this.acUnits[acType];
		const CO2 = this.acUnits.CO2;

		return (acNumber * kwh * activeMonths * activeHours * 30 * CO2) / persons;
	}

	public calculateAircraftEmission(
		{
			aircraftType,
			trips,
		}: {
			aircraftType: AircraftTypes;
			trips: number;
		},
	) {
		if (trips < 1) {
			throw new BadRequestError('Invalid number of trips');
		}

		if (aircraftType != aircraftType) {
			throw new BadRequestError('Invalid aircraft type');
		}

		const { CO2, CH4, N2O, distance } = this.aircraftEmissions[aircraftType];
		const CH4_GWP = this.vehicleEmissions.gwp.CH4;
		const N2O_GWP = this.vehicleEmissions.gwp.N2O;

		return trips * distance * this.getFuelEmission(CO2, CH4, CH4_GWP, N2O, N2O_GWP) * 12;
	}

	public calculateKitchenEmission(
		{
			kitchenType,
			burners,
			activeDays,
			timesPerDay,
			timePerMeal,
		}: {
			kitchenType: KitchenType;
			burners: number;
			activeDays: number;
			timesPerDay: number;
			timePerMeal: number;
		},
	) {
		if (burners < 1 && kitchenType != 'firewood') {
			throw new BadRequestError('Invalid number of burners');
		} else if (kitchenType == 'firewood') burners = 1; // firewood only has 1 burner

		if (kitchenType != 'gas' && kitchenType != 'electric') {
			throw new BadRequestError('Invalid kitchen type');
		}

		const CO2 = this.kitchen[kitchenType].CO2;
		const burnersConsumption = this.kitchen[kitchenType].burners;
		const time = timesPerDay * timePerMeal * activeDays / 7;

		return time * burnersConsumption * burners * CO2 * 365;
	}

	public calculateFoodEmission({
		foodType,
		foodAmount,
	}: {
		foodType: foodType;
		foodAmount: number; // times per week
	}) {
		if (
			foodType != 'cow' && foodType != 'pork' && foodType != 'lamb' && foodType != 'bird' &&
			foodType != 'fish' && foodType != 'mixed'
		) {
			throw new BadRequestError('Invalid food type');
		}
		if (foodAmount < 1 || foodAmount > 7) {
			throw new BadRequestError('Invalid food amount');
		}

		const CO2 = this.food[foodType];

		return foodAmount * 0.2 * 52 * CO2; // 0.2 kg per meal, 52 weeks
	}

	public calculateConsumedFoodEmission({ foodType }: { foodType: consumedFoodType }) {
		if (
			foodType != 'fresh_locales' && foodType != 'mix' && foodType != 'frozen_canned'
		) {
			throw new BadRequestError('Invalid consumed food type');
		}

		const { kg, CO2 } = this.consumedFood[foodType];

		return kg * CO2 * 12;
	}

	public calculatePlasticEmission({ plasticAmount }: { plasticAmount: string }) {
		if (
			plasticAmount != 'never' && plasticAmount != 'rarely' && plasticAmount != 'sometimes' &&
			plasticAmount != 'often'
		) {
			throw new BadRequestError('Invalid plastic amount');
		}

		const CO2 = this.plastic.CO2;
		return this.plastic[plasticAmount] * 0.02 * 52 * CO2; // 0.02 kg per plastic article, 52 weeks
	}

	private getEmissionData(
		carNumber: number,
		fuelType: 'diesel' | 'gasoline',
		carType: VehicleTypes,
		year: Year,
		kilometers: number,
		publicTransport?: boolean,
	) {
		const n = carNumber;
		const d = kilometers;

		if (!this.vehicleEmissions[carType] || !this.vehicleEmissions[carType][fuelType]) {
			throw new NotFoundError(
				`Emission data for fuel type '${fuelType}' not found for vehicle type '${carType}'.`,
			);
		}
		const fuelVehicle = this.vehicleEmissions[carType]?.[fuelType];
		let CO2 = fuelVehicle.CO2;
		if (carType === 'heavy_truck' && publicTransport) {
			CO2 = CO2 / 40;
		}
		const { CH4, N2O } = fuelVehicle[year];
		const CH4_GWP = this.vehicleEmissions.gwp.CH4;
		const N2O_GWP = this.vehicleEmissions.gwp.N2O;

		return n * d * this.getFuelEmission(CO2, CH4, CH4_GWP, N2O, N2O_GWP);
	}

	private getFuelEmission(
		CO2: number,
		CH4: number,
		GH4_GWP: number,
		N2O: number,
		N2O_GWP: number,
	) {
		return CO2 + (CH4 * 0.621371 * (GH4_GWP / 1000)) + (N2O * 0.621371 * (N2O_GWP / 1000));
	}

	private getElectricEmission(electricEmissionFactor: number, kwh: number) {
		return kwh * electricEmissionFactor;
	}

	private getElectricEmissionData(carNumber: number, carType: VehicleTypes, kilometers: number) {
		const n = carNumber;
		const d = kilometers;
		const electricVehicle = this.vehicleEmissions[carType]?.electric;
		if (!electricVehicle) {
			throw new NotFoundError(
				`Factores no encontrados para el vehiculo: ${carType} de tipo electrico`,
			);
		}
		const kwh = electricVehicle.kwh;
		const electricEmissionFactor = this.vehicleEmissions.electricEmissionFactor;
		return n * d * this.getElectricEmission(electricEmissionFactor, kwh);
	}

	private getHybridEmissionData(
		carNumber: number,
		fuelType: 'diesel' | 'gasoline',
		year: Year,
		carType: VehicleTypes,
		electricConsumptionPercentage: number,
		kilometers: number,
	) {
		const n = carNumber;
		const d = kilometers;
		const fuelVehicle = this.vehicleEmissions[carType]?.[fuelType];
		if (!fuelVehicle) {
			throw new NotFoundError(
				`Factores no encontrados para el vehiculo: ${carType}, con combustible: ${fuelType}, del año: ${year}`,
			);
		}
		const CO2 = fuelVehicle.CO2;
		const { CH4, N2O } = fuelVehicle[year];
		const CH4_GWP = this.vehicleEmissions.gwp.CH4;
		const N2O_GWP = this.vehicleEmissions.gwp.N2O;
		const electricVehicle = this.vehicleEmissions[carType]?.electric;
		if (!electricVehicle) {
			throw new NotFoundError(`Factores no encontrados para el vehiculo: ${carType}`);
		}
		const kwh = electricVehicle.kwh;
		const electricEmissionFactor = this.vehicleEmissions.electricEmissionFactor;

		const electricEmission = this.getElectricEmission(electricEmissionFactor, kwh) *
			electricConsumptionPercentage;

		const fuelEmission = this.getFuelEmission(CO2, CH4, CH4_GWP, N2O, N2O_GWP) *
			(1 - electricConsumptionPercentage);

		return n * d * (electricEmission + fuelEmission);
	}
}

export default new EmissionCalculator();
