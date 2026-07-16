export type SurplusLot = {
	id: string;
	fishType: string;
	lbs: number;
	supplier: string;
	expiryDays: number;
	pricePerLb: number;
};

export const mockSurplusFeed: SurplusLot[] = [
	{
		id: 'lot-101',
		fishType: 'Pacific Sardine',
		lbs: 8600,
		supplier: 'Monterey Harbor Co-op',
		expiryDays: 2,
		pricePerLb: 0.72
	},
	{
		id: 'lot-102',
		fishType: 'Albacore Tuna',
		lbs: 4200,
		supplier: 'Half Moon Bay Fisheries',
		expiryDays: 4,
		pricePerLb: 1.88
	},
	{
		id: 'lot-103',
		fishType: 'Pink Salmon',
		lbs: 5100,
		supplier: 'North Coast Landing',
		expiryDays: 3,
		pricePerLb: 1.24
	},
	{
		id: 'lot-104',
		fishType: 'Mackerel',
		lbs: 3900,
		supplier: 'San Pedro Seafood Exchange',
		expiryDays: 1,
		pricePerLb: 0.81
	}
];

export const getMockSurplusFeed = () => mockSurplusFeed;
