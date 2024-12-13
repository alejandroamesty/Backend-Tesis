// Base types for emissions factors
type EmissionFactors = {
	CH4: number;
	N2O: number;
};

// Year range type
export type Year = '1960-1982' | '1983-2006' | '2007-2024';

// Emissions data for fossil fuels (diesel/gasoline)
type FossilFuelEmissions = Record<Year, EmissionFactors> & {
	CO2: number;
};

// Emissions data for electric vehicles
type ElectricEmissions = {
	kwh: number;
};

type VehicleFuelEmissions = {
	diesel?: FossilFuelEmissions;
	gasoline?: FossilFuelEmissions;
	electric?: ElectricEmissions;
};

// Vehicle types and their associated emissions
export type VehicleTypes = 'motorcycle' | 'car' | 'light_truck' | 'heavy_truck';
type GWP = {
	CO2: number;
	CH4: number;
	N2O: number;
};

export type EmissionsData = Record<VehicleTypes, VehicleFuelEmissions> & {
	electricEmissionFactor: number;
	gwp: GWP;
};

export type AircraftTypes = 'domestic' | 'short' | 'long';

export type AircraftEmissions = Record<AircraftTypes, GWP & { distance: number }>;

export type AcType = 'split' | 'window' | 'central' | 'portable';

export type AcEmissions = Record<AcType, { btu: number; kwh: number }> & { CO2: number };

export type KitchenType = 'gas' | 'electric' | 'firewood';

export type KitchenEmissions = Record<KitchenType, { CO2: number; burners: number }>;

export type foodType = 'cow' | 'pork' | 'lamb' | 'bird' | 'fish' | 'mixed';

export type FoodEmissions = Record<foodType, number>;

export type consumedFoodType = 'fresh_locales' | 'mix' | 'frozen_canned';
export type consumedFoodEmissions = Record<consumedFoodType, { kg: number; CO2: number }>;
